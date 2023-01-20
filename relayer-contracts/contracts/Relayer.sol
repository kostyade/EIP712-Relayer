// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ITokenERC20Permit.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @dev forked and influenced by OZ MinimalForwarder
 */

contract MinimalForwarder {
    using ECDSA for bytes32;

    struct TransferRequest {
        address owner;
        address spender;
        uint256 value;
        uint256 nonce;
        uint256 deadline;
    }

    event Log(string message);

    function verify(
        TransferRequest calldata req,
        bytes calldata signature
    ) public view returns (bool) {
        ITokenERC20Permit relayedToken = ITokenERC20Permit(req.tokenAddress);

        bytes32 structHash = keccak256(
            abi.encode(
                relayedToken.PERMIT_TYPEHASH(),
                req.owner,
                req.spender,
                req.value,
                req.nonce,
                req.deadline
            )
        );

        address signer = ECDSA
            .toTypedDataHash(relayedToken.DOMAIN_SEPARATOR(), structHash)
            .recover(signature);

        return
            relayedToken.nonces(req.owner) == req.nonce && signer == req.from;
    }

    function transfer(
        TransferRequest calldata req,
        bytes calldata signature
    ) public payable returns (bool, bytes memory) {
        require(
            req.spender == address(this),
            "spender and relayer does not match"
        );
        require(verify(req, signature), "signature does not match request");

        ITokenERC20Permit relayedToken = ITokenERC20Permit(req.tokenAddress);

        try
            relayedToken.permit(
                req.owner,
                req.sender,
                req.value,
                req.nonce,
                req.deadline
            )
        {
            try relayedToken.transferFrom(req.owner, address(0), req.value) {
                emit Log("success");
            } catch {
                emit Log("transfer failed");
            }
        } catch {
            emit Log("permit failed");
        }
    }
}
