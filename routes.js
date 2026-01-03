const express = require("express");
const router = express.Router();
const crypto = require("crypto");

// Middleware profissional de autenticação
const authenticate = (req, res, next) => {
  const { auth_hash } = req.body;
  const secret = process.env.AUTH_SECRET_KEY;

  if (!auth_hash || !secret) {
    return res
      .status(401)
      .json({ error: "Não autorizado. Hash ou segredo ausente." });
  }

  // Exemplo de validação simples de hash (pode ser ajustado conforme a lógica desejada)
  // Aqui estamos apenas verificando se o hash existe. Em um cenário real, você faria a comparação.
  if (auth_hash !== secret) {
    return res.status(403).json({ error: "Autenticação falhou." });
  }

  next();
};

// Rota GET - Dados do Usuário
router.get("/user", (req, res) => {
  res.json({
    id: process.env.USER_ID_KEY,
    name: "Rodrigo Palmeira",
    age: 32,
  });
});

// Rota POST - Criar Pedidos (Protegida)
router.post("/orders", authenticate, (req, res) => {
  const { orders } = req.body;

  if (!Array.isArray(orders)) {
    return res
      .status(400)
      .json({ error: "O campo orders deve ser uma lista." });
  }

  console.log("Pedidos recebidos:", orders);

  res.status(200).json({
    message: "Pedidos processados com sucesso",
    count: orders.length,
    status: "ok",
  });
});

// Nova rota GET - Teste de Envio de Ordem em Lote (Fixa)
router.get("/batchorder", async (req, res) => {
  const Polymarket = require("./polymarket");
  const poly = new Polymarket();

  // Parâmetros fixos de teste
  const testOrders = [
    {
      tokenID:
        "71321045679252212594626385532706912750332728571942532289631379312455583992563", // Exemplo YES token
      price: 0.1,
      side: "BUY",
      size: 5,
    },
  ];

  try {
    const resp = await poly.PlaceBatchOrders(testOrders);
    res.json({
      success: true,
      message: "Ordem de teste enviada com sucesso",
      response: resp,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao enviar ordem de teste",
      error: error.message,
    });
  }
});

module.exports = router;
