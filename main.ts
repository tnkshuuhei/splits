interface Payment {
  member_name: string;
  price_to_get: number;
}

interface Liquidation {
  debtor: string;
  creditor: string;
  amount: number;
}

interface Transaction {
  creditor: string;
  debtors: string[];
  amount: number;
}

function calculation(
  payment: Payment[],
  liquidation: Liquidation[] = []
): [Payment[], Liquidation[]] {
  payment.sort((a, b) => b.price_to_get - a.price_to_get);

  const creditor = payment[0];
  const debtor = payment[payment.length - 1];

  const amount = Math.min(creditor.price_to_get, Math.abs(debtor.price_to_get));

  if (amount === 0) {
    return [payment, liquidation];
  }

  creditor.price_to_get -= amount;
  debtor.price_to_get += amount;

  liquidation.push({
    debtor: debtor.member_name,
    creditor: creditor.member_name,
    amount: amount,
  });

  return calculation(payment, liquidation);
}

function generatePayments(transactions: Transaction[]): Payment[] {
  const payments: { [key: string]: number } = {};

  for (const transaction of transactions) {
    if (!(transaction.creditor in payments)) {
      payments[transaction.creditor] = 0;
    }
    payments[transaction.creditor] += transaction.amount;

    const debtPerPerson = transaction.amount / transaction.debtors.length;
    for (const debtor of transaction.debtors) {
      if (!(debtor in payments)) {
        payments[debtor] = 0;
      }
      payments[debtor] -= debtPerPerson;
    }
  }

  const paymentArr: Payment[] = [];
  for (const member in payments) {
    paymentArr.push({ member_name: member, price_to_get: payments[member] });
  }

  return paymentArr;
}

const sample_transactions: Transaction[] = [
  {
    creditor: "addr1",
    debtors: ["addr1", "addr2", "addr3"],
    amount: 200,
  },
  {
    creditor: "addr2",
    debtors: ["addr2", "addr4"],
    amount: 60,
  },
  {
    creditor: "addr3",
    debtors: ["addr3", "addr1"],
    amount: 40, // Frank has paid 500 in total. So, Alice and David owe 250 each to Frank.
  },
];

function main() {
  const sample_data: Payment[] = generatePayments(sample_transactions);

  console.log("Balances before settlement:");
  for (const payment of sample_data) {
    console.log(`${payment.member_name}: ${payment.price_to_get}`);
  }

  const [updatedPayments, liquidations] = calculation([...sample_data]);

  console.log("-----------------");
  console.log("Transfers during settlement:");
  for (const l of liquidations) {
    console.log(`${l.debtor} -> ${l.creditor}: ${l.amount}`);
  }

  console.log("-----------------");
  console.log("Balances after settlement:");
  for (const p of updatedPayments) {
    console.log(`${p.member_name}: ${p.price_to_get}`);
  }

  console.log("-----------------");
  const total = sample_data.reduce((acc, curr) => acc + curr.price_to_get, 0);
  console.log(`Net settlement amount: ${total}`);
}

main();
