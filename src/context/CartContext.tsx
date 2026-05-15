'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { CartItem, Product } from '@/types/database'

interface CartContextValue {
  items: CartItem[]
  count: number
  total: number
  add: (product: Product, variant_id?: string, variant_name?: string, qty?: number) => void
  remove: (product_id: string, variant_id?: string) => void
  setQty: (product_id: string, variant_id: string | undefined, qty: number) => void
  clear: () => void
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue>({
  items: [], count: 0, total: 0,
  add: () => {}, remove: () => {}, setQty: () => {}, clear: () => {},
  isOpen: false, openCart: () => {}, closeCart: () => {},
})

const KEY = 'kb-cart'

function itemKey(product_id: string, variant_id?: string) {
  return `${product_id}::${variant_id || 'default'}`
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items))
  }, [items])

  const add = useCallback((product: Product, variant_id?: string, variant_name?: string, qty = 1) => {
    const key = itemKey(product.id, variant_id)
    const unit_price = product.price_sek
    setItems((prev) => {
      const existing = prev.find((i) => itemKey(i.product.id, i.variant_id) === key)
      if (existing) {
        return prev.map((i) =>
          itemKey(i.product.id, i.variant_id) === key
            ? { ...i, qty: i.qty + qty }
            : i
        )
      }
      return [...prev, { product, variant_id, variant_name, qty, unit_price }]
    })
    setIsOpen(true)
  }, [])

  const remove = useCallback((product_id: string, variant_id?: string) => {
    const key = itemKey(product_id, variant_id)
    setItems((prev) => prev.filter((i) => itemKey(i.product.id, i.variant_id) !== key))
  }, [])

  const setQty = useCallback((product_id: string, variant_id: string | undefined, qty: number) => {
    if (qty <= 0) { remove(product_id, variant_id); return }
    const key = itemKey(product_id, variant_id)
    setItems((prev) => prev.map((i) =>
      itemKey(i.product.id, i.variant_id) === key ? { ...i, qty } : i
    ))
  }, [remove])

  const clear = useCallback(() => setItems([]), [])
  const count = items.reduce((s, i) => s + i.qty, 0)
  const total = items.reduce((s, i) => s + i.unit_price * i.qty, 0)

  return (
    <CartContext.Provider value={{ items, count, total, add, remove, setQty, clear, isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false) }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
