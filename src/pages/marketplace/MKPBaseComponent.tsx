import {PlatformContractType} from "../../constants"
import {Button, Spin, Descriptions, Modal} from "antd"
import React, {Dispatch, SetStateAction, useEffect, useState} from "react"
import {AbiItem, toBN} from "web3-utils"
import {ContractApi} from "../apis/ContractApi"
import {DeployedContractApi, DeployedContractsDto} from "../apis/DeployedContractApi"
import {web3} from "../DeployByMetamaks"
import {callMethod} from "../utils/metamask"
import {Contract} from "web3-eth-contract"
import {RadioTargListDiv} from "../utils/InputDiv"

type SendTx = () => Promise<any>

export enum MKP_FUNCTION {
    CHANGE_ISKRA_INCOME_WALLET,
    CHANGE_PURCHASER_FEE_PERMILLE,
    CHANGE_GAME_OWNER,
    CLAIM_REVENUE
}

export function MKPBaseComponent(prop: {
                                     onClickSendTx: SendTx,
                                     contractSetter: Dispatch<SetStateAction<Contract | undefined>>,
                                     InputDiv?: Function,
                                     gameAddress?: string,
                                     functionType: MKP_FUNCTION
                                 }
) {
    const [loading, setLoading] = useState<boolean>(false)
    const [deployedContracts, setDeployedContracts] = useState<DeployedContractsDto[]>([])
    const [idx, setIdx] = useState<number>(0)

    const [owner, setOwner] = useState<string>('')
    const [curReceiver, setCurReceiver] = useState<string>('')
    const [feeRate, setFeeRate] = useState<number>()

    useEffect(() => {
        console.log(prop.gameAddress)
        window.ethereum?.on('chainChanged', () => window.location.reload())
        if (window.ethereum?.chainId && window.ethereum.selectedAddress) {
            DeployedContractApi.getDeployedContracts({
                chainId: toBN(window.ethereum.chainId).toString(),
                contractType: PlatformContractType.ISKRA_MKP
            })
                .then(res => {
                    setDeployedContracts(res.data)
                })
        }
    }, [prop])

    function prepareContract() {
        let tmpContract: Contract;
        ContractApi.getContract(deployedContracts[idx].contract.id)
            .then(ret => {
                tmpContract = new web3.eth.Contract(JSON.parse(JSON.stringify(ret.data.abi)) as AbiItem[], deployedContracts[idx].address)
                prop.contractSetter(tmpContract)
                if (tmpContract) {
                    callMethod(tmpContract.methods.owner()).then(res => {
                        setOwner(res)
                    })
                    callMethod(tmpContract.methods.iskraIncomeWallet()).then(res => {
                        setCurReceiver(res)
                    })
                    callMethod(tmpContract.methods.purchaserFeePermille()).then(res => {
                        setFeeRate(res)
                    })
                }
            })
    }

    function onClickHandle() {
        setLoading(true)
        prop.onClickSendTx()
            .then(ret => {
                console.log(ret)
                if (prop.functionType == MKP_FUNCTION.CHANGE_ISKRA_INCOME_WALLET)
                    setCurReceiver(ret)
                else if (prop.functionType == MKP_FUNCTION.CHANGE_PURCHASER_FEE_PERMILLE)
                    setFeeRate(ret)

                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                alert('ERROR OCCURRED')
                setLoading(false)
            })
    }

    function MKPContractInfo() {
        return (
            <Descriptions bordered title={'MKP CONTRACT INFO'}>
                <Descriptions.Item label={'OWNER'} span={3}> {owner && owner} </Descriptions.Item>
                <Descriptions.Item label={'FEE RECEIVER'} span={3}> {curReceiver && curReceiver} </Descriptions.Item>
                <Descriptions.Item label={'FEE RATE'} span={3}> {feeRate && feeRate} </Descriptions.Item>
            </Descriptions>
        )
    }

    return (
        <div>
            <Spin spinning={loading}>
                {deployedContracts.length > 0 && <RadioTargListDiv targList={deployedContracts.map(item => {
                    return {
                        id: item.id,
                        contractName: item.contract.name,
                        contractType: item.contract.contractType,
                        chainName: item.chain.name,
                        address: item.address
                    }
                })} callBack={prepareContract} setTarg={setIdx}/>}
                {prop.InputDiv && <prop.InputDiv/>}
                {<Button type='primary' onClick={onClickHandle}
                         disabled={((window.ethereum?.selectedAddress) ? (owner.toLocaleUpperCase() !== window.ethereum?.selectedAddress.toLocaleUpperCase()) : true)}>
                    SEND TX </Button>}
                <hr/>
                <MKPContractInfo/>
            </Spin>
        </div>
    )
}

export function GameContractInfo(prop: { contract: Contract, gameAddress: string, visible : boolean, visibleSetter : Dispatch<SetStateAction<boolean>> }) {
    const [gameOwner, setGameOwner] = useState<string>('')
    const [rsRate, setRsRate] = useState<number>(0)
    const [revenue, setRevenue] = useState<number>(0)
    useEffect(() => {
        if (prop.gameAddress.length >= 42) {
            callMethod(prop.contract.methods.gameContracts(prop.gameAddress)).then(res => {
                setGameOwner(res['owner'])
                setRsRate(res['rsRate'])
                setRevenue(res['revenue'])
            }).catch((err) => {
                console.error(err)
                setGameOwner('-')
                setRsRate(0)
                setRevenue(0)
            })
        } else {
            setGameOwner('-')
            setRsRate(0)
            setRevenue(0)
        }
    }, [prop])
    return (
        <Modal visible={prop.visible} onCancel={()=>prop.visibleSetter(false)} onOk={()=>prop.visibleSetter(false)}>
            <Descriptions bordered title={'GAME INFO'}>
                <Descriptions.Item label={'GAME CONTRACT'}
                                   span={3}> {prop.gameAddress && prop.gameAddress} </Descriptions.Item>
                <Descriptions.Item label={'OWNER'} span={3}> {gameOwner && gameOwner} </Descriptions.Item>
                <Descriptions.Item label={'RS RATE'} span={3}> {rsRate && rsRate} </Descriptions.Item>
                <Descriptions.Item label={'REVENUE'} span={3}> {revenue && revenue} </Descriptions.Item>
            </Descriptions>
        </Modal>
    )
}
