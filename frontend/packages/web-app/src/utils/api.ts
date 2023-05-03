export const  getOpenSeaOrder = async (collection: string, tokenId: string): Promise<any> => {
    console.log(collection)
    const endpoint = `https://testnets-api.opensea.io/v2/orders/mumbai/seaport/listings?asset_contract_address=${collection}&token_ids=${tokenId}`;

    console.log(endpoint)
  
    const response = await fetch(endpoint);
  
    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }
  
    const orders = await response.json();
  
    return orders;
  }
