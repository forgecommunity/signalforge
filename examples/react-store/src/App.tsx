import React from "react";
import { createRoot } from "react-dom/client";
import { batch, createStore } from "signalforge/core";
import { useComputed, useStoreSelector } from "signalforge/react";
import "./style.css";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

const cartStore = createStore({
  customer: "Ada Lovelace",
  items: [
    { id: 1, name: "Signal Plan", price: 19, quantity: 1 },
    { id: 2, name: "Native Pack", price: 49, quantity: 2 },
  ] as CartItem[],
  coupon: "",
});

function updateQuantity(id: number, quantity: number) {
  cartStore.set((state) => ({
    ...state,
    items: state.items.map((item) =>
      item.id === id ? { ...item, quantity } : item
    ),
  }));
}

function applyLaunchCoupon() {
  batch(() => {
    cartStore.set({ coupon: "LAUNCH20" });
    cartStore.set((state) => ({
      ...state,
      items: state.items.map((item) =>
        item.id === 1 ? { ...item, quantity: item.quantity + 1 } : item
      ),
    }));
  });
}

function CustomerHeader() {
  const customer = useStoreSelector(cartStore, (state) => state.customer);
  const coupon = useStoreSelector(cartStore, (state) => state.coupon);

  return (
    <header className="toolbar">
      <div>
        <h1>SignalForge Store</h1>
        <p>{customer}</p>
      </div>
      <button onClick={applyLaunchCoupon}>
        {coupon ? coupon : "Apply launch coupon"}
      </button>
    </header>
  );
}

function CartRows() {
  const items = useStoreSelector(cartStore, (state) => state.items);

  return (
    <section className="rows">
      {items.map((item) => (
        <article className="row" key={item.id}>
          <div>
            <strong>{item.name}</strong>
            <span>${item.price}</span>
          </div>
          <input
            aria-label={`${item.name} quantity`}
            min={0}
            type="number"
            value={item.quantity}
            onChange={(event) =>
              updateQuantity(item.id, Number(event.currentTarget.value))
            }
          />
          <span>${item.price * item.quantity}</span>
        </article>
      ))}
    </section>
  );
}

function Summary() {
  const items = useStoreSelector(cartStore, (state) => state.items);
  const coupon = useStoreSelector(cartStore, (state) => state.coupon);
  const subtotal = useComputed(() =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  , [items]);
  const discount = coupon === "LAUNCH20" ? subtotal * 0.2 : 0;

  return (
    <aside className="summary">
      <span>Subtotal ${subtotal.toFixed(2)}</span>
      <span>Discount ${discount.toFixed(2)}</span>
      <strong>Total ${(subtotal - discount).toFixed(2)}</strong>
    </aside>
  );
}

function App() {
  return (
    <main>
      <CustomerHeader />
      <CartRows />
      <Summary />
    </main>
  );
}

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(<App />);
}
