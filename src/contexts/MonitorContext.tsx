import React, { createContext, useState } from 'react'

export type TFilterName = 'N3' | 'N2' | 'Default' | 'testnet' | 'mainnet'

export type MonitorContent = {
  showMessage: boolean
  message: string
  filterName: TFilterName
  stopRender: boolean
  setShowMessage: React.Dispatch<React.SetStateAction<boolean>>
  setMessage: React.Dispatch<React.SetStateAction<string>>
  setFilterName: React.Dispatch<React.SetStateAction<TFilterName>>
  setStopRender: React.Dispatch<React.SetStateAction<boolean>>
}

export const MonitorContext = createContext({} as MonitorContent)

export const MonitorProvider: React.FC = ({ children }) => {
  const [showMessage, setShowMessage] = useState(false)
  const [message, setMessage] = useState('')
  const [filterName, setFilterName] = useState<TFilterName>('N3')
  const [stopRender, setStopRender] = useState<boolean>(false)

  return (
    <MonitorContext.Provider
      value={{
        message,
        showMessage,
        filterName,
        stopRender,
        setMessage,
        setShowMessage,
        setFilterName,
        setStopRender,
      }}
    >
      {children}
    </MonitorContext.Provider>
  )
}
