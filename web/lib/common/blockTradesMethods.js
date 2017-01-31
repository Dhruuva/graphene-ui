import ls from "./localStorage";
const blockTradesStorage = new ls("");

function fetchCoins(url = "https://blocktrades.us/ol/api/v2/coins") {
    return fetch(url).then(reply => reply.json().then(result => {
        return result;
    })).catch(err => {
        console.log("error fetching blocktrades list of coins", err, url);
    });
}

function requestDepositAddress({ inputCoinType, outputCoinType, outputAddress, url, stateCallback }) {
    let body = {
        inputCoinType,
        outputCoinType,
        outputAddress
    };

    let body_string = JSON.stringify(body);

    fetch(url + "/simple-api/initiate-trade", {
        method: "post",
        headers: new Headers({ "Accept": "application/json", "Content-Type": "application/json" }),
        body: body_string
    }).then(reply => {
        reply.json()
            .then(json => {
                // console.log( "reply: ", json )
                let address = { "address": json.inputAddress || "unknown", "memo": json.inputMemo };
                if (stateCallback) stateCallback(address);
            }, error => {
                // console.log( "error: ",error  );
                if (stateCallback) stateCallback({ "address": "unknown", "memo": null });
            });
    }, error => {
        // console.log( "error: ",error  );
        if (stateCallback) stateCallback({ "address": "unknown", "memo": null });
    });
}

function getBackedCoins({ allCoins, backer }) {
    let coins_by_type = {};
    allCoins.forEach(coin_type => coins_by_type[coin_type.coinType] = coin_type);
    let blocktradesBackedCoins = [];
    allCoins.forEach(coin_type => {
        if (coin_type.walletSymbol.startsWith(backer + ".") && coin_type.backingCoinType) {
            blocktradesBackedCoins.push({
                name: coins_by_type[coin_type.backingCoinType].name,
                walletType: coins_by_type[coin_type.backingCoinType].walletType,
                backingCoinType: coins_by_type[coin_type.backingCoinType].walletSymbol,
                symbol: coin_type.walletSymbol,
                supportsMemos: coins_by_type[coin_type.backingCoinType].supportsOutputMemos
            });
        }
    });
    return blocktradesBackedCoins;
}

function validateAddress({ url = "https://bitshares.openledger.info/depositwithdraw/api/v2", walletType, newAddress }) {
    return fetch(
        url + "/wallets/" + walletType + "/address-validator?address=" + encodeURIComponent(newAddress), {
            method: "get",
            headers: new Headers({ "Accept": "application/json" })
        }).then(reply => reply.json().then(json => json.isValid));
}

function hasWithdrawalAddress(wallet) {
    return blockTradesStorage.has(`history_address_${wallet}`);
}

function setWithdrawalAddresses({ wallet, addresses }) {
    blockTradesStorage.set(`history_address_${wallet}`, addresses);
}

function getWithdrawalAddresses(wallet) {
    return blockTradesStorage.get(`history_address_${wallet}`, []);
}

function setLastWithdrawalAddress({ wallet, address }) {
    blockTradesStorage.set(`history_address_last_${wallet}`, address);
}

function getLastWithdrawalAddress(wallet) {
    return blockTradesStorage.get(`history_address_last_${wallet}`, "");
}

let WithdrawAddresses = {
    has: hasWithdrawalAddress,
    set: setWithdrawalAddresses,
    get: getWithdrawalAddresses,
    setLast: setLastWithdrawalAddress,
    getLast: getLastWithdrawalAddress
};

export {
    fetchCoins,
    getBackedCoins,
    requestDepositAddress,
    validateAddress,
    WithdrawAddresses
};

export default {
    fetchCoins,
    getBackedCoins,
    requestDepositAddress,
    validateAddress,
    WithdrawAddresses
};
