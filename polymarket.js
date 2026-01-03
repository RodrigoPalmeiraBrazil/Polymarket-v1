const { ClobClient } = require('@polymarket/clob-client');

class Polymarket {
    constructor() {
        this.host = "https://clob.polymarket.com";
        this.key = process.env.POLYMARKET_PRIVATE_KEY;
        this.chainId = 137;
        this.proxyAddress = process.env.POLYMARKET_PROXY_ADDRESS;
        this.apiKey = process.env.POLYMARKET_API_KEY;

        // Inicializa o cliente para Email/Magic account (signature_type: 1)
        // Se for Wallet (Metamask etc), use signature_type: 2
        this.client = new ClobClient(
            this.host, 
            this.chainId, 
            this.key, 
            1, 
            this.proxyAddress
        );
    }

    /**
     * Envia múltiplas ordens em lote (Batch)
     * @param {Array} orders - Lista de objetos PostOrdersArgs
     */
    async PlaceBatchOrders(orders) {
        try {
            // Garante que as credenciais da API estejam configuradas
            // createOrDeriveApiCreds pode ser necessário se for a primeira vez
            // Mas geralmente usamos as que já temos no secret
            
            console.log("Enviando lote de ordens para Polymarket...");
            const resp = await this.client.postOrders(orders);
            return resp;
        } catch (error) {
            console.error("Erro ao enviar ordens em lote:", error);
            throw error;
        }
    }

    /**
     * Cancela múltiplas ordens em lote
     * @param {Array} orderIds - Lista de strings com os IDs das ordens
     */
    async CancelBatchOrders(orderIds) {
        try {
            console.log("Cancelando lote de ordens na Polymarket...");
            const resp = await this.client.cancelOrders(orderIds);
            return resp;
        } catch (error) {
            console.error("Erro ao cancelar ordens em lote:", error);
            throw error;
        }
    }
}

module.exports = Polymarket;
