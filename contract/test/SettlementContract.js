const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("SettlementContract", function () {
  let settlementContract;
  let contract;
  let addr1;
  let addr2;
  let addr3;
  let addr4;

  async function deployContract() {
    settlementContract = await ethers.getContractFactory("SettlementContract");
    contract = await settlementContract.deploy();
    return contract;
  }

  beforeEach(async function () {
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    contract = await deployContract();
  });

  describe("Transactions and Settlements", function () {
    it("Should correctly record and settle debts", async function () {
      // addr1 is creditor, addr2 and addr3 are debtors, with total amount 200
      await contract.addTransaction(
        addr1.address,
        [addr1.address, addr2.address, addr3.address],
        300
      );

      // addr2 owes addr4 60
      await contract.addTransaction(
        addr2.address,
        [addr2.address, addr4.address],
        600
      );

      // addr3 owes addr1 another 40
      await contract.addTransaction(
        addr3.address,
        [addr1.address, addr3.address],
        420
      );

      // Check payments after adding transactions
      let payment1 = await contract.payments(0);
      let payment2 = await contract.payments(1);
      let payment3 = await contract.payments(2);
      let payment4 = await contract.payments(3);

      expect(payment1.member_name).to.equal(addr1.address);
      expect(payment1.price_to_get).to.equal(-10);
      expect(payment2.member_name).to.equal(addr2.address);
      expect(payment2.price_to_get).to.equal(200);
      expect(payment3.member_name).to.equal(addr3.address);
      expect(payment3.price_to_get).to.equal(110);
      expect(payment4.member_name).to.equal(addr4.address);
      expect(payment4.price_to_get).to.equal(-300);

      // Settle debts
      await contract.settleDebts();

      // Check liquidations after settling debts
      let liquidations = await contract.getLiquidations();
      console.log(liquidations);
      console.log(liquidations[0]);
      console.log(liquidations[1]);
      console.log(liquidations[2]);

      // expect(liquidations.length).to.equal(3);

      // // Verify first liquidation (where addr2 pays addr1)
      // expect(liquidations[0].debtor).to.equal(addr2.address);
      // expect(liquidations[0].creditor).to.equal(addr1.address);
      // expect(liquidations[0].amount).to.equal(70);

      // // Verify second liquidation (where addr3 pays addr1)
      // expect(liquidations[1].debtor).to.equal(addr3.address);
      // expect(liquidations[1].creditor).to.equal(addr1.address);
      // expect(liquidations[1].amount).to.equal(80);

      // // Verify third liquidation (where addr4 pays addr2)
      // expect(liquidations[2].debtor).to.equal(addr4.address);
      // expect(liquidations[2].creditor).to.equal(addr1.address);
      // expect(liquidations[2].amount).to.equal(30);
    });
  });
});
