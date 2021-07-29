const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const buyTicket = async (ticket, domain) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Stubborn Attachments",
          },
          unit_amount: ticket.price,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${domain}/success.html`,
    cancel_url: `${domain}/cancel.html`,
  });
};
