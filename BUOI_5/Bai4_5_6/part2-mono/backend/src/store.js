export const db = {
  restaurants: [
    {
      id: "r1",
      name: "Bun Bo Hue Co Lan",
      deliveryFee: 15000,
      menu: [
        { id: "m1", name: "Bun Bo Dac Biet", price: 55000 },
        { id: "m2", name: "Cha Gio", price: 30000 },
        { id: "m3", name: "Tra Dao", price: 18000 }
      ]
    },
    {
      id: "r2",
      name: "Com Tam Sai Gon 1988",
      deliveryFee: 12000,
      menu: [
        { id: "m4", name: "Com Tam Suon Bi Cha", price: 50000 },
        { id: "m5", name: "Com Ga Nuong", price: 48000 },
        { id: "m6", name: "Canh Rong Bien", price: 15000 }
      ]
    }
  ],
  orders: []
};

export function findRestaurantById(restaurantId) {
  return db.restaurants.find((restaurant) => restaurant.id === restaurantId);
}

export function findMenuItem(restaurant, menuItemId) {
  return restaurant.menu.find((menuItem) => menuItem.id === menuItemId);
}
