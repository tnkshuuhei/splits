// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SettlementContract {
    // Define a payment structure
    struct Payment {
        address member_name;
        int256 price_to_get;
    }

    // Define a liquidation structure
    struct Liquidation {
        address debtor;
        address creditor;
        uint256 amount;
    }

    // Array to store payments
    Payment[] public payments;
    // Array to store liquidations
    Liquidation[] public liquidations;

    // Add a transaction
    function addTransaction(
        address creditor,
        address[] calldata debtors,
        uint256 amount
    ) public {
        uint256 debtPerPerson = amount / debtors.length;
        uint256 remainder = amount % debtors.length;

        _updatePayment(creditor, int256(amount));

        for (uint i = 0; i < debtors.length; i++) {
            int256 debt = int256(debtPerPerson);

            if (i == 0) {
                debt += int256(remainder);
            }

            _updatePayment(debtors[i], -debt);
        }
    }

    function _updatePayment(address member, int256 value) private {
        bool found = false;
        for (uint i = 0; i < payments.length; i++) {
            if (payments[i].member_name == member) {
                payments[i].price_to_get += value;
                found = true;
                break;
            }
        }
        if (!found) {
            payments.push(Payment({member_name: member, price_to_get: value}));
        }
    }

    // Function to settle debts
    function settleDebts() public {
        for (uint i = 0; i < payments.length; i++) {
            for (uint j = i + 1; j < payments.length; j++) {
                if (
                    signsDiffer(
                        payments[i].price_to_get,
                        payments[j].price_to_get
                    )
                ) {
                    uint256 amount = uint256(
                        min(
                            abs(payments[i].price_to_get),
                            abs(payments[j].price_to_get)
                        )
                    );
                    liquidations.push(
                        Liquidation({
                            debtor: payments[i].price_to_get < 0
                                ? payments[i].member_name
                                : payments[j].member_name,
                            creditor: payments[i].price_to_get > 0
                                ? payments[i].member_name
                                : payments[j].member_name,
                            amount: amount
                        })
                    );
                    if (payments[i].price_to_get > payments[j].price_to_get) {
                        payments[i].price_to_get -= int256(amount);
                        payments[j].price_to_get += int256(amount);
                    } else {
                        payments[i].price_to_get += int256(amount);
                        payments[j].price_to_get -= int256(amount);
                    }
                }
            }
        }
    }

    function getLiquidations() public view returns (Liquidation[] memory) {
        return liquidations;
    }

    function min(int256 a, int256 b) private pure returns (int256) {
        return a < b ? a : b;
    }

    function abs(int256 x) private pure returns (int256) {
        return x >= 0 ? x : -x;
    }

    function signsDiffer(int256 a, int256 b) private pure returns (bool) {
        return (a < 0 && b > 0) || (a > 0 && b < 0);
    }
}
