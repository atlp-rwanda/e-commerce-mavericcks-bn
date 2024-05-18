const checkoutButton = document.getElementById('checkout-button');

checkoutButton.addEventListener('click', () => {
  fetch('api/payments/charge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [
        { id: 'f0b655c0-6ad5-47f0-8d71-60929c656508', quantity: 3 },
        { id: 'a1a8403f-0351-401c-9c20-9cf0fdb4f8e5', quantity: 1 },
      ],
    }),
  })
    .then(res => {
      if (res.ok) return res.json();
    })
    .then(({ url }) => {
      window.location = url;
    })
    .catch(err => {
      console.log(err.message);
    });
});
