// ─────────────────────────────────────────────────────────────────────────────
// Wave Care — Suite de Testes
// Cobre: Produtos · Carrinho · Cálculo de Preço · Checkout · Validações
// ─────────────────────────────────────────────────────────────────────────────
//
// Como rodar:
//   npm install --save-dev jest
//   npx jest wavecare.test.js
//
// ─────────────────────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES TESTÁVEIS
// Extraia estas funções dos seus arquivos e importe aqui, ex:
//   import { getProductById, addToCart, getTotal, checkout } from "@/lib/cart";
//
// Por enquanto estão definidas inline para os testes rodarem direto.
// ══════════════════════════════════════════════════════════════════════════════

// ── Produtos ─────────────────────────────────────────────────────────────────

const mockProducts = [
  { id: 1, name: "Shampoo Wave Care",          price: 89.90, category: "Cabelos",      stock: 42, active: true  },
  { id: 2, name: "Condicionador Deep Moisture", price: 99.90, category: "Cabelos",      stock: 5,  active: true  },
  { id: 3, name: "Máscara Hidratante Intensa",  price: 149.90, category: "Tratamento", stock: 20, active: true  },
  { id: 4, name: "Óleo Capilar Brilho",         price: 75.00, category: "Finalizadores", stock: 0, active: false },
];

function getProducts(products = mockProducts) {
  return products;
}

function getProductById(id, products = mockProducts) {
  return products.find(p => p.id === id) ?? null;
}

function searchProducts(query, products = mockProducts) {
  const q = query.toLowerCase();
  return products.filter(p => p.name.toLowerCase().includes(q));
}

function filterByCategory(category, products = mockProducts) {
  return products.filter(p => p.category === category);
}

function getActiveProducts(products = mockProducts) {
  return products.filter(p => p.active);
}

// ── Carrinho ──────────────────────────────────────────────────────────────────

function addToCart(cart, item) {
  if (!item || item.qty <= 0) throw new Error("Quantidade inválida");
  if (!item.id)               throw new Error("Produto inválido");

  const existing = cart.find(c => c.id === item.id);
  if (existing) {
    return cart.map(c => c.id === item.id ? { ...c, qty: c.qty + item.qty } : c);
  }
  return [...cart, item];
}

function removeFromCart(cart, productId) {
  return cart.filter(c => c.id !== productId);
}

function updateQty(cart, productId, qty) {
  if (qty < 0) throw new Error("Quantidade não pode ser negativa");
  if (qty === 0) return removeFromCart(cart, productId);
  return cart.map(c => c.id === productId ? { ...c, qty } : c);
}

function clearCart() {
  return [];
}

// ── Cálculo de preço ──────────────────────────────────────────────────────────

function getSubtotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function applyDiscount(subtotal, discountPercent) {
  if (discountPercent < 0 || discountPercent > 100) throw new Error("Desconto inválido");
  return subtotal * (1 - discountPercent / 100);
}

function calcShipping(subtotal) {
  if (subtotal >= 200) return 0;       // frete grátis acima de R$200
  if (subtotal >= 100) return 9.90;
  return 19.90;
}

function getTotal(cart, discountPercent = 0) {
  const subtotal  = getSubtotal(cart);
  const discounted = applyDiscount(subtotal, discountPercent);
  const shipping  = calcShipping(discounted);
  return parseFloat((discounted + shipping).toFixed(2));
}

// ── Checkout ──────────────────────────────────────────────────────────────────

function validateAddress(address) {
  return (
    address &&
    address.street &&
    address.city &&
    address.zip &&
    address.zip.replace(/\D/g, "").length === 8
  );
}

function checkout(cart, user, address) {
  if (!user || !user.id)         throw new Error("Usuário não autenticado");
  if (!cart || cart.length === 0) throw new Error("Carrinho vazio");
  if (!validateAddress(address)) throw new Error("Endereço inválido");

  const total = getTotal(cart);
  return {
    status: "success",
    orderId: `ORD-${Date.now()}`,
    userId: user.id,
    total,
    items: cart,
    address,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// DADOS COMPARTILHADOS NOS TESTES
// ──────────────────────────────────────────────────────────────────────────────

const validUser = { id: 42, nome: "Ana Lima", email: "ana@email.com" };

const validAddress = {
  street: "Rua das Ondas, 123",
  city:   "São Paulo",
  zip:    "01310-100",
};

const sampleCart = [
  { id: 1, name: "Shampoo Wave Care",          price: 89.90, qty: 2 },
  { id: 3, name: "Máscara Hidratante Intensa",  price: 149.90, qty: 1 },
];

// ══════════════════════════════════════════════════════════════════════════════
// 1. PRODUTOS
// ══════════════════════════════════════════════════════════════════════════════

describe("1. Produtos", () => {

  describe("Listagem", () => {
    test("retorna todos os produtos", () => {
      expect(getProducts()).toHaveLength(4);
    });

    test("retorna apenas produtos ativos", () => {
      const ativos = getActiveProducts();
      expect(ativos).toHaveLength(3);
      ativos.forEach(p => expect(p.active).toBe(true));
    });
  });

  describe("Busca por ID", () => {
    test("retorna produto correto pelo ID", () => {
      const product = getProductById(1);
      expect(product).toMatchObject({ id: 1, name: "Shampoo Wave Care", price: 89.90 });
    });

    test("retorna null se produto não existir", () => {
      expect(getProductById(999)).toBeNull();
    });
  });

  describe("Busca por nome", () => {
    test("encontra produto por nome parcial (case-insensitive)", () => {
      expect(searchProducts("wave")).toHaveLength(1);
      expect(searchProducts("WAVE")).toHaveLength(1);
    });

    test("retorna lista vazia se nenhum produto bater", () => {
      expect(searchProducts("xyzxyz")).toHaveLength(0);
    });
  });

  describe("Filtro por categoria", () => {
    test("filtra corretamente por categoria", () => {
      const cabelos = filterByCategory("Cabelos");
      expect(cabelos).toHaveLength(2);
      cabelos.forEach(p => expect(p.category).toBe("Cabelos"));
    });

    test("retorna vazio para categoria inexistente", () => {
      expect(filterByCategory("Maquiagem")).toHaveLength(0);
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. CARRINHO
// ══════════════════════════════════════════════════════════════════════════════

describe("2. Carrinho de compras", () => {

  describe("Adicionar produto", () => {
    test("adiciona item em carrinho vazio", () => {
      const result = addToCart([], { id: 1, name: "Shampoo", price: 89.90, qty: 1 });
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ id: 1, qty: 1 });
    });

    test("aumenta quantidade se produto já estiver no carrinho", () => {
      const cart = [{ id: 1, name: "Shampoo", price: 89.90, qty: 1 }];
      const result = addToCart(cart, { id: 1, qty: 2 });
      expect(result).toHaveLength(1);
      expect(result[0].qty).toBe(3);
    });

    test("adiciona produto diferente como novo item", () => {
      const cart = [{ id: 1, name: "Shampoo", price: 89.90, qty: 1 }];
      const result = addToCart(cart, { id: 2, name: "Condicionador", price: 99.90, qty: 1 });
      expect(result).toHaveLength(2);
    });

    test("não aceita quantidade zero ou negativa", () => {
      expect(() => addToCart([], { id: 1, qty: 0  })).toThrow("Quantidade inválida");
      expect(() => addToCart([], { id: 1, qty: -1 })).toThrow("Quantidade inválida");
    });

    test("não aceita item sem ID de produto", () => {
      expect(() => addToCart([], { qty: 1 })).toThrow("Produto inválido");
    });
  });

  describe("Remover produto", () => {
    test("remove item do carrinho", () => {
      const cart = [
        { id: 1, price: 89.90, qty: 1 },
        { id: 2, price: 99.90, qty: 2 },
      ];
      const result = removeFromCart(cart, 1);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    test("não quebra ao remover produto que não está no carrinho", () => {
      const cart = [{ id: 1, price: 89.90, qty: 1 }];
      const result = removeFromCart(cart, 999);
      expect(result).toHaveLength(1);
    });

    test("retorna carrinho vazio ao remover único item", () => {
      const cart = [{ id: 1, price: 89.90, qty: 1 }];
      expect(removeFromCart(cart, 1)).toHaveLength(0);
    });
  });

  describe("Atualizar quantidade", () => {
    test("atualiza a quantidade corretamente", () => {
      const cart = [{ id: 1, price: 89.90, qty: 1 }];
      const result = updateQty(cart, 1, 5);
      expect(result[0].qty).toBe(5);
    });

    test("remove item ao setar quantidade 0", () => {
      const cart = [{ id: 1, price: 89.90, qty: 3 }];
      expect(updateQty(cart, 1, 0)).toHaveLength(0);
    });

    test("lança erro para quantidade negativa", () => {
      const cart = [{ id: 1, price: 89.90, qty: 1 }];
      expect(() => updateQty(cart, 1, -1)).toThrow("Quantidade não pode ser negativa");
    });
  });

  describe("Limpar carrinho", () => {
    test("retorna carrinho vazio", () => {
      expect(clearCart()).toEqual([]);
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. CÁLCULO DE PREÇO
// ══════════════════════════════════════════════════════════════════════════════

describe("3. Cálculo de preço", () => {

  describe("Subtotal", () => {
    test("soma corretamente múltiplos itens e quantidades", () => {
      // (89.90 × 2) + (149.90 × 1) = 329.70
      expect(getSubtotal(sampleCart)).toBeCloseTo(329.70, 2);
    });

    test("retorna 0 para carrinho vazio", () => {
      expect(getSubtotal([])).toBe(0);
    });

    test("funciona com item de qty 1", () => {
      expect(getSubtotal([{ price: 75, qty: 1 }])).toBe(75);
    });
  });

  describe("Desconto", () => {
    test("aplica 10% de desconto corretamente", () => {
      expect(applyDiscount(100, 10)).toBeCloseTo(90, 2);
    });

    test("aplica 0% (sem desconto)", () => {
      expect(applyDiscount(100, 0)).toBe(100);
    });

    test("aplica 100% (gratuito)", () => {
      expect(applyDiscount(100, 100)).toBe(0);
    });

    test("lança erro para desconto inválido", () => {
      expect(() => applyDiscount(100, -5)).toThrow("Desconto inválido");
      expect(() => applyDiscount(100, 101)).toThrow("Desconto inválido");
    });
  });

  describe("Frete", () => {
    test("frete grátis para compras acima de R$200", () => {
      expect(calcShipping(250)).toBe(0);
      expect(calcShipping(200)).toBe(0);
    });

    test("frete R$9,90 para compras entre R$100 e R$199,99", () => {
      expect(calcShipping(150)).toBe(9.90);
      expect(calcShipping(100)).toBe(9.90);
    });

    test("frete R$19,90 para compras abaixo de R$100", () => {
      expect(calcShipping(50)).toBe(19.90);
      expect(calcShipping(99.99)).toBe(19.90);
    });
  });

  describe("Total final", () => {
    test("calcula total sem desconto (com frete grátis)", () => {
      // subtotal 329.70 → frete grátis → total 329.70
      expect(getTotal(sampleCart)).toBe(329.70);
    });

    test("calcula total com desconto", () => {
      // subtotal 329.70 → -10% = 296.73 → frete grátis → 296.73
      expect(getTotal(sampleCart, 10)).toBe(296.73);
    });

    test("retorna 0 + frete base para carrinho vazio", () => {
      // subtotal 0 → frete R$19,90
      expect(getTotal([])).toBe(19.90);
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. CHECKOUT
// ══════════════════════════════════════════════════════════════════════════════

describe("4. Checkout", () => {

  test("finaliza pedido com sucesso quando tudo está correto", () => {
    const result = checkout(sampleCart, validUser, validAddress);
    expect(result.status).toBe("success");
    expect(result).toMatchObject({
      userId: validUser.id,
      items:  sampleCart,
      address: validAddress,
    });
    expect(result.orderId).toMatch(/^ORD-/);
  });

  test("total do pedido está correto no retorno", () => {
    const result = checkout(sampleCart, validUser, validAddress);
    expect(result.total).toBe(getTotal(sampleCart));
  });

  test("não permite checkout com carrinho vazio", () => {
    expect(() => checkout([], validUser, validAddress)).toThrow("Carrinho vazio");
  });

  test("não permite checkout sem usuário autenticado", () => {
    expect(() => checkout(sampleCart, null, validAddress)).toThrow("Usuário não autenticado");
    expect(() => checkout(sampleCart, {},   validAddress)).toThrow("Usuário não autenticado");
  });

  test("não permite checkout com endereço faltando campos", () => {
    expect(() => checkout(sampleCart, validUser, { city: "SP", zip: "01310-100" }))
      .toThrow("Endereço inválido");
  });

  test("não permite checkout com CEP inválido", () => {
    const badAddress = { ...validAddress, zip: "123" };
    expect(() => checkout(sampleCart, validUser, badAddress)).toThrow("Endereço inválido");
  });

  test("não permite checkout sem endereço", () => {
    expect(() => checkout(sampleCart, validUser, null)).toThrow("Endereço inválido");
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. VALIDAÇÕES IMPORTANTES (borda / edge cases)
// ══════════════════════════════════════════════════════════════════════════════

describe("5. Validações e casos de borda", () => {

  test("quantidade mínima aceitável é 1", () => {
    const result = addToCart([], { id: 1, qty: 1, price: 89.90 });
    expect(result[0].qty).toBe(1);
  });

  test("não pode adicionar produto com qty negativa", () => {
    expect(() => addToCart([], { id: 1, qty: -5 })).toThrow();
  });

  test("produto inexistente no catálogo retorna null", () => {
    expect(getProductById(9999)).toBeNull();
  });

  test("produto sem estoque está como inactive", () => {
    const semEstoque = mockProducts.find(p => p.stock === 0);
    expect(semEstoque?.active).toBe(false);
  });

  test("checkout sem login deve lançar erro", () => {
    expect(() => checkout(sampleCart, undefined, validAddress)).toThrow("Usuário não autenticado");
  });

  test("checkout sem itens deve lançar erro", () => {
    expect(() => checkout([], validUser, validAddress)).toThrow("Carrinho vazio");
  });

  test("desconto não pode passar de 100%", () => {
    expect(() => applyDiscount(100, 150)).toThrow("Desconto inválido");
  });

  test("desconto não pode ser negativo", () => {
    expect(() => applyDiscount(100, -10)).toThrow("Desconto inválido");
  });

  test("CEP com máscara ainda é validado corretamente", () => {
    const result = validateAddress({ ...validAddress, zip: "01310-100" });
    expect(result).toBe(true);
  });

  test("CEP sem máscara também é validado", () => {
    const result = validateAddress({ ...validAddress, zip: "01310100" });
    expect(result).toBe(true);
  });

  test("CEP curto demais retorna endereço inválido", () => {
    const result = validateAddress({ ...validAddress, zip: "0131" });
    expect(result).toBe(false);
  });
});