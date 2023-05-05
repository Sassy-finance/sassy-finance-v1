const HOST = 'https://testnets-api.opensea.io'
import axios from "axios";


export const getOrderData = async (hash: string, chain: string, protocol_address: string, address: string) => {
    const payload = {
        listing: {
            hash,
            chain,
            protocol_address
        },
        fulfiller: {
            address
        }
    }

    const response = await axios.post(
        `${HOST}/v2/listings/fulfillment_data`,
        payload
      );

    return response.data;
}