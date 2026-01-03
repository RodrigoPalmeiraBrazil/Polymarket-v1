const express = require("express");
const app = express();
const routes = require("./routes");
const port = 5000;

// Middleware para processar JSON no corpo das requisições
app.use(express.json());

// Concentra todas as rotas no arquivo separado
app.use("/api", routes);

// Rota raiz para redirecionamento ou status simples
app.get("/", (req, res) => {
  res.send("API Online. Use /api/user para GET ou /api/orders para POST.");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});

console.log("Data de hoje:", new Date().toLocaleDateString());

