import React from "react";
import AccountStore from "stores/AccountStore";
import SettingsStore from "stores/SettingsStore";

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
                stores={[AccountStore, SettingsStore]}
                inject={{
                    linkedAccounts: () => {
                        return AccountStore.getState().linkedAccounts;
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
                    }
                }}>
                    <Content {...this.props} />
            </AltContainer>
        );
    }
}

export default DashboardContainer;
