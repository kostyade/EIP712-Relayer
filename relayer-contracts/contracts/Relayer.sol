// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./ITokenERC20Permit.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @dev influenced by OZ MinimalForwarder, 0x, Uniswap
 */

contract Relayer {
    using ECDSA for bytes32;

    struct TransferRequest {
        address owner;
        address spender;
        uint256 value;
        uint256 nonce;
        uint256 deadline;
    }

    event TransferSuccess(address owner, uint256 value);

    event TransferFailed(address owner, uint256 value, bytes reason);

    function verify(
        TransferRequest calldata req,
        bytes calldata signature,
        address tokenAddress
    ) public view returns (bool) {
        ITokenERC20Permit relayedToken = ITokenERC20Permit(tokenAddress);

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
            relayedToken.nonces(req.owner) == req.nonce && signer == req.owner;
    }

    function batchDeposit(
        TransferRequest[] calldata _requests,
        bytes[] calldata _signatures,
        address[] calldata _tokenAddresses
    ) external {
        require(
            _requests.length == _signatures.length,
            "signatures must match requests"
        );

        for (uint256 i = 0; i < _requests.length; ++i) {
            deposit(_requests[i], _signatures[i], _tokenAddresses[i]);
        }
    }

    function deposit(
        TransferRequest calldata req,
        bytes calldata signature,
        address tokenAddress
    ) public {
        require(
            req.spender == address(this),
            "spender and relayer does not match"
        );
        require(
            verify(req, signature, tokenAddress),
            "signature does not match request"
        );

        ITokenERC20Permit relayedToken = ITokenERC20Permit(tokenAddress);

        try
            relayedToken.permit(
                req.owner,
                req.spender,
                req.value,
                req.deadline,
                signature
            )
        {
            try relayedToken.transferFrom(req.owner, req.spender, req.value) {
                emit TransferSuccess(req.owner, req.value);
            } catch (bytes memory reason) {
                emit TransferFailed(req.owner, req.value, reason);
            }
        } catch (bytes memory reason) {
            emit TransferFailed(req.owner, req.value, reason);
        }
    }
}
