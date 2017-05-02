import React from "react";
import AccountStore from "stores/AccountStore";
import SettingsStore from "stores/SettingsStore";
import MarketsStore from "stores/MarketsStore";

import AltContainer from "alt-container";
import Dashboard from "./Dashboard";

import SimpleDashboard from "./SimpleDashboard";

class Content extends React.Component {

    render() {
        return this.props.traderMode ? <Dashboard {...this.props} /> : <SimpleDashboard {...this.props} />;
    }
}

class DashboardContainer extends React.Component {
    render() {
        return (
            <AltContainer
                stores={[AccountStore, SettingsStore, MarketsStore]}
                inject={{
                    linkedAccounts: () => {
                        return AccountStore.getState().linkedAccounts;
                    },
                    my_accounts: () => {
                        return AccountStore.getMyAccounts();
                    },
                    myIgnoredAccounts: () => {
                        return AccountStore.getState().myIgnoredAccounts;
                    },
                    currentAccount: () => {
                        return AccountStore.getState().currentAccount;
                    },
                    viewSettings: () => {
                        return SettingsStore.getState().viewSettings;
                    },
                    preferredUnit: () => {
                        return SettingsStore.getState().settings.get("unit", "1.3.0");
                    },
                    traderMode: () => {
                        return SettingsStore.getState().settings.get("traderMode");
                    },
                    defaultAssets: () => {
                        return SettingsStore.getState().topMarkets;
                    },
                    accountsReady: () => {
                        return AccountStore.getState().accountsLoaded && AccountStore.getState().refsLoaded;
                    },
                    passwordAccount: () => {
                        return AccountStore.getState().passwordAccount;
                    },
                    lowVolumeMarkets: () => {
                        return MarketsStore.getState().lowVolumeMarkets;
                    },
                    // marketStats: () => {
                    //     return MarketsStore.getState().allMarketStats;
                    // }
                }}>
                    <Content {...this.props} />
            </AltContainer>
        );
    }
}

export default DashboardContainer;
