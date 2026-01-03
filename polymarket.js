const { ClobClient } = require('@polymarket/clob-client');
const { ethers } = require('ethers');

class Polymarket {
    constructor() {
        this.host = process.env.CLOB_API_URL || "https://clob.polymarket.com";
        this.key = process.env.POLYMARKET_PRIVATE_KEY;
        this.chainId = parseInt(process.env.CHAIN_ID) || 137;
        
        // Credenciais da API (ApiKeyCreds)
        this.creds = {
            key: process.env.POLYMARKET_API_KEY,
            secret: process.env.POLYMARKET_API_SECRET,
            passphrase: process.env.POLYMARKET_PASS_PHRASE,
        };

        // Wallet para assinatura
        this.wallet = new ethers.Wallet(this.key);

        // Inicializa o cliente seguindo o padrão do exemplo
        this.client = new ClobClient(
            this.host, 
            this.chainId, 
            this.wallet, 
            this.creds
        );
    }

    /**
     * Envia múltiplas ordens em lote (Batch)
     * @param {Array} orders - Lista de objetos PostOrdersArgs
     */
    async PlaceBatchOrders(orders) {
        try {
            console.log("Enviando lote de ordens para Polymarket...");
            const resp = await this.client.postOrders(orders);
            return resp;
        } catch (error) {
            console.error("Erro ao enviar ordens em lote:", error);
            throw error;
        }
    }

    /**
     * Cancela uma única ordem
     * @param {string} orderId - O ID da ordem a ser cancelada
     */
    async CancelOrder(orderId) {
        try {
            console.log(`Cancelando ordem ${orderId} na Polymarket...`);
            const resp = await this.client.cancelOrder({ orderID: orderId });
            return resp;
        } catch (error) {
            console.error("Erro ao cancelar ordem:", error);
            throw error;
        }
    }

    /**
     * Cancela múltiplas ordens em lote (conforme o último exemplo enviado)
     * @param {Array} orderIds - Lista de strings com os IDs das ordens
     */
    async CancelBatchOrders(orderIds) {
        try {
            console.log("Cancelando lote de ordens na Polymarket...");
            // O método cancelOrders no cliente oficial recebe a lista diretamente
            const resp = await this.client.cancelOrders(orderIds);
            return resp;
        } catch (error) {
            console.error("Erro ao cancelar ordens em lote:", error);
            throw error;
        }
    }

    /**
     * Helper para criar uma ordem assinada
     */
    async CreateOrder(params) {
        return await this.client.createOrder(params);
    }
}

module.exports = Polymarket;
