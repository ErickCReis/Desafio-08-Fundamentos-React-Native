import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const list = await AsyncStorage.getItem('GoMarketplace:Products');

      if (list) setProducts(JSON.parse(list));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productIndex = products.findIndex(prod => product.id === prod.id);
      if (productIndex !== -1) {
        const newList = [...products];
        newList[productIndex].quantity += 1;
        setProducts(newList);
      } else {
        const newProduct: Product = product;
        newProduct.quantity = 1;
        setProducts([newProduct, ...products]);
      }

      await AsyncStorage.setItem(
        'GoMarketplace:Products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(prod => id === prod.id);
      if (productIndex !== -1) {
        const newList = [...products];
        newList[productIndex].quantity += 1;
        setProducts(newList);

        await AsyncStorage.setItem(
          'GoMarketplace:Products',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(prod => id === prod.id);
      if (productIndex !== -1) {
        const newList = [...products];

        if (newList[productIndex].quantity === 1) {
          newList.splice(productIndex, 1);
        } else {
          newList[productIndex].quantity -= 1;
        }
        setProducts(newList);

        await AsyncStorage.setItem(
          'GoMarketplace:Products',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
