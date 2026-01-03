const { ClobClient, Side, OrderType } = require("@polymarket/clob-client");
const { ethers } = require("ethers");

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
            this.creds,
        );
    }

    /**
     * Envia múltiplas ordens em lote (Batch) com sanitização automática
     * @param {Array} rawOrders - Lista de ordens enviadas pelo usuário
     */
    async PlaceBatchOrders(rawOrders) {
        try {
            console.log("Sanitizando e assinando ordens para Polymarket...");

            const processedOrders = await Promise.all(
                rawOrders.map(async (item) => {
                    // Converte a string "BUY"/"SELL" para o ENUM correspondente
                    const side = item.side === "BUY" ? Side.BUY : Side.SELL;

                    // Cria a ordem assinada
                    const signedOrder = await this.client.createOrder({
                        tokenID: item.tokenID,
                        price: item.price,
                        side: side,
                        size: item.size,
                    });

                    // Retorna no formato PostOrdersArgs esperado pela API
                    return {
                        order: signedOrder,
                        orderType: OrderType.GTC,
                    };
                }),
            );

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
     * Helper para criar uma ordem assinada (caso precise usar fora do batch)
     */
    async CreateOrder(params) {
        return await this.client.createOrder(params);
    }
}

module.exports = Polymarket;
