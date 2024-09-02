import type { Dispatch, PropsWithChildren, SetStateAction } from "react"
import React, { useSyncExternalStore } from "react"
import type {
  InjectedExtension,
  InjectedPolkadotAccount,
} from "polkadot-api/pjs-signer"
import { useSelectedExtensions } from "./hooks"
import { SignerCtx } from "./signerCtx"

import { getExtensionIcon } from "@polkadot-ui/assets/extensions"
import type { CommonConfigType, SelectedAccountType } from "./types"

const Accounts: React.FC<{
  extension: InjectedExtension
  setSelectedAccount: React.Dispatch<React.SetStateAction<SelectedAccountType>>
  selectedAccount: SelectedAccountType
  config: CommonConfigType
}> = ({ extension, setSelectedAccount, selectedAccount, config }) => {
  const accounts = useSyncExternalStore(
    extension.subscribe,
    extension.getAccounts
  )

  const borderDesc = config?.border
    ? config?.border?.size.concat(
        ` ${config?.border?.type}`,
        ` ${config?.border?.color}`
      )
    : "0.1rem solid #8A8A8A"

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {accounts.map((account: InjectedPolkadotAccount) => {
        const ExtensionIcon = getExtensionIcon(extension.name)
        return (
          <button
            onClick={() =>
              setSelectedAccount({
                address: account.address,
                name: account.name,
                extension: extension.name,
                polkadotSigner: account.polkadotSigner,
                type: account.type,
              })
            }
            key={account.address}
            style={{
              display: "flex",
              padding: "1rem 0",
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              height: "3rem",
              border: borderDesc,
              borderRadius: "0.5rem",
              margin: "0.5rem 0",
              background:
                account.address === selectedAccount?.address
                  ? config?.selectedBgColor || "#CACACA"
                  : config?.bgColor || "",
            }}
          >
            {ExtensionIcon && (
              <div style={{ width: "4rem", height: "2rem" }}>
                <ExtensionIcon />
              </div>
            )}
            <div style={{ display: "flex", width: "40%" }}>
              {account.name ?? account.address}
            </div>
            {/* {account.name && (
        <div style={{ display: "flex", width: "30%" }}>
          {ellipsisFn(account.address)}
        </div>
      )} 
      <div style={{ display: "flex", width: "15%", color: "#6A6A6A" }}>
        {equalizer ? "Selected" : ""}
      </div>*/}
          </button>
        )
      })}
    </div>
  )
}

export const AccountProvider: React.FC<
  PropsWithChildren<{
    selected: SelectedAccountType
    setSelected: Dispatch<SetStateAction<SelectedAccountType>>
    config?: CommonConfigType
  }>
> = ({ children, selected, setSelected, config }) => {
  const extensions = useSelectedExtensions()

  return (
    <>
      <div
        style={{
          display: "flex",
          paddingTop: "2rem",
          justifyContent: "space-between",
        }}
      >
        <h4>Accounts</h4>
        {selected?.address ? (
          <button
            style={{
              cursor: "pointer",
              color: "firebrick",
              fontWeight: "bold",
            }}
            onClick={() => setSelected(null)}
          >
            Disconnect
          </button>
        ) : null}
      </div>
      {extensions.map((extension) => (
        <Accounts
          config={config}
          key={extension.name}
          {...{ extension }}
          setSelectedAccount={setSelected}
          selectedAccount={selected}
        />
      ))}
      <SignerCtx account={selected}>{children}</SignerCtx>
    </>
  )
}
