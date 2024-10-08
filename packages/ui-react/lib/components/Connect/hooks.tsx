import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react"
import { SelectedAccountCtx } from "./accountCtx"
import { extensionCtx } from "./extensionCtx"
import {
  InjectedPolkadotAccount,
  getInjectedExtensions,
} from "polkadot-api/pjs-signer"
import { Any } from "../../utils"
import {
  getExtensionsStore,
  localStorageKeyAccount,
  localStorageKeyExtensions,
} from "./utils"

const getJoinedInjectedExtensions = () => getInjectedExtensions()?.join(",")

export const useSelectedAccount = () => useContext(SelectedAccountCtx)!
export const useSelectedExtensions = () => useContext(extensionCtx)
export const useAvailableExtensions = (): string[] => {
  const [extensions, setExtensions] = useState(getJoinedInjectedExtensions)

  useEffect(() => {
    let token: Any
    const updateExtensions = () => {
      const jointedExtensions = getJoinedInjectedExtensions()
      setExtensions(jointedExtensions)
      token = setTimeout(updateExtensions, jointedExtensions ? 2_000 : 100)
    }
    updateExtensions()

    return () => {
      clearTimeout(token)
    }
  }, [])

  return useMemo(() => extensions?.split(",") ?? [], [extensions])
}

export const useConnectLocalStorage = (key: string, defaultValue: string) => {
  const [value, setLocal] = useState(() => {
    const getStorageValue = (key: string, defaultValue: string) => {
      const saved = localStorage.getItem(key)
      const initial = JSON.parse(saved)
      return initial || defaultValue
    }

    return getStorageValue(key, defaultValue)
  })

  const setValue = (name: string) => {
    const a = value?.split(",")
    let b: string[]
    if (a.includes(name)) {
      const index = a.indexOf(name)
      if (index > -1) a.splice(index, 1)
      b = a
    } else {
      b = [...a, name]
    }
    setLocal(b.join(","))
  }

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  const removeItem = () => {
    localStorage.removeItem(key)
  }

  return [value, setValue, removeItem]
}

export const useExtensionAccounts = () => {
  const [extensionAccounts, setExtensionAccounts] = useState<
    InjectedPolkadotAccount[]
  >([])

  return [extensionAccounts, setExtensionAccounts]
}

const extensionsStore = getExtensionsStore()

export const useConnect = () => {
  const [extensionLocalStorage, , removeExtItem] = useConnectLocalStorage(
    localStorageKeyExtensions,
    ""
  )

  const [accountLocalStorage, setAccountLocalStorage, remAccItem] =
    useConnectLocalStorage(localStorageKeyAccount, "")

  const [connectedAccounts, setConnectedAccounts] = useState<
    InjectedPolkadotAccount[]
  >([])

  const [connectedAccount, setConnectedAccount] =
    useState<InjectedPolkadotAccount>()
  const connectedExtensions = useSyncExternalStore(
    extensionsStore.subscribe,
    extensionsStore.getSnapshot
  )

  const disconnectAll = useCallback(() => {
    extensionsStore.disconnect(extensionLocalStorage)
    removeExtItem()
    remAccItem()
  }, [extensionLocalStorage, removeExtItem, remAccItem])

  useEffect(() => {
    const acc: InjectedPolkadotAccount[] = []
    for (const [, value] of connectedExtensions) {
      acc.push(...value.getAccounts())
    }
    setConnectedAccounts(acc)
  }, [connectedExtensions])

  useEffect(() => {
    const account = connectedAccounts.filter(
      (a) => a.address === accountLocalStorage
    )
    if (account.length) {
      setConnectedAccount(account[0])
      setAccountLocalStorage(account[0])
    }
  }, [accountLocalStorage, connectedAccounts, setAccountLocalStorage])

  useEffect(() => {
    extensionsStore.revive(extensionLocalStorage)
  }, [extensionLocalStorage])

  return {
    connectedExtensions,
    connectedAccounts,
    connectedAccount,
    disconnectAll,
  }
}
