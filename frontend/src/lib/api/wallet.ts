export async function getWallet() {
  return {
    balance: 850,

    transactions: [
      {
        id: 1,
        type: "Deposit",
        amount: "+$120",
      },
      {
        id: 2,
        type: "Order",
        amount: "-$40",
      },
      {
        id: 3,
        type: "Deposit",
        amount: "+$250",
      },
      {
        id: 4,
        type: "Order",
        amount: "-$75",
      },
    ],
  };
}