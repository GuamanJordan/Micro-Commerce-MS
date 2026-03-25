import { defineStore } from 'pinia';
import api from '../api/axios';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    totalPrice: 0,
    totalItems: 0
  }),
  actions: {
    async fetchCart() {
      try {
        const { data } = await api.get('/cart');
        this.items = data.items || [];
        this.totalPrice = data.totalPrice || 0;
        this.totalItems = data.totalItems || 0;
      } catch (error) {
        console.error("Error al cargar carrito", error);
      }
    },
    async addToCart(productId, quantity) {
      await api.post('/cart/add', { productId, quantity });
      await this.fetchCart();
    },
    async clearCart() {
      await api.delete('/cart');
      this.items = [];
      this.totalPrice = 0;
      this.totalItems = 0;
    }
  }
});
