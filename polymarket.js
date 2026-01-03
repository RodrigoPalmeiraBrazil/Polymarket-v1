const { ClobClient, Side, OrderType } = require('@polymarket/clob-client');
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

        // Validação da chave privada para evitar erros de hexlify
        if (!this.key || this.key === "123456") {
            console.error("ERRO: POLYMARKET_PRIVATE_KEY inválida ou não configurada corretamente.");
            // Não lançamos erro no constructor para não quebrar o servidor, 
            // mas as chamadas que dependem da wallet falharão.
            this.wallet = null;
        } else {
            try {
                this.wallet = new ethers.Wallet(this.key);
            } catch (e) {
                console.error("ERRO ao inicializar Wallet:", e.message);
                this.wallet = null;
            }
        }

        // Inicializa o cliente se a wallet for válida
        if (this.wallet) {
            this.client = new ClobClient(
                this.host, 
                this.chainId, 
                this.wallet, 
                this.creds
            );
        }
    }

    /**
     * Envia múltiplas ordens em lote (Batch) com sanitização automática
     * @param {Array} rawOrders - Lista de ordens enviadas pelo usuário
     */
    async PlaceBatchOrders(rawOrders) {
        if (!this.client) {
            throw new Error("Cliente Polymarket não inicializado. Verifique sua POLYMARKET_PRIVATE_KEY nos Secrets.");
        }
        try {
            console.log("Sanitizando e assinando ordens para Polymarket...");
            
            const processedOrders = await Promise.all(rawOrders.map(async (item) => {
                const side = item.side === 'BUY' ? Side.BUY : Side.SELL;

                const signedOrder = await this.client.createOrder({
                    tokenID: item.tokenID,
                    price: item.price,
                    side: side,
                    size: item.size
                });

                return {
                    order: signedOrder,
                    orderType: OrderType.GTC,
                    owner: this.creds.key
                };
            }));

            console.log(`Enviando lote de ${processedOrders.length} ordens...`);
            const resp = await this.client.postOrders(processedOrders);
            return resp;
        } catch (error) {
            console.error("Erro ao processar/enviar ordens em lote:", error);
            throw error;
        }
    }

    /**
     * Cancela uma única ordem
     * @param {string} orderId - O ID da ordem a ser cancelada
     */
    async CancelOrder(orderId) {
        if (!this.client) throw new Error("Cliente não inicializado.");
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
     * Cancela múltiplas ordens em lote
     * @param {Array} orderIds - Lista de strings com os IDs das ordens
     */
    async CancelBatchOrders(orderIds) {
        if (!this.client) throw new Error("Cliente não inicializado.");
        try {
            console.log("Cancelando lote de ordens na Polymarket...");
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
        if (!this.client) throw new Error("Cliente não inicializado.");
        return await this.client.createOrder(params);
    }
}

module.exports = Polymarket;
