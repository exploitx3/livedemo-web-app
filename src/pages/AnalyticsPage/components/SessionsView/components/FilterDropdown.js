import React, {useEffect, useRef, useState} from "react";
import styled from 'styled-components'
import 'antd/es/input/style'
import Button from 'antd/es/button'
import 'antd/es/button/style'
import List from "antd/es/list";
import 'antd/es/list/style'
import Checkbox from "antd/es/checkbox";
import 'antd/es/checkbox/style'
import {Select} from "antd";

const FilterDropdown = ({confirm, clearFilters, itemsMap}) => {
  let searchInput = useRef(null)

  let [innerItemsMap, setInnerItemsMap] = useState(itemsMap)
  let [listOfItems, setListOfItems] = useState(Object.keys(itemsMap))
  let [selectAll, setSelectAll] = useState(false)

  useEffect(() => {
    setInnerItemsMap(itemsMap)
    setListOfItems(Object.keys(itemsMap))
  }, [itemsMap]);

  return (
    <FD.FilterWrapper style={{padding: 8}}>
      <FD.SelectAllLine>
        <Checkbox checked={selectAll} onChange={
          function (e) {
            let checkValue = e.target.checked
            if (checkValue) {
              let newMap = Object.entries({...innerItemsMap}).reduce((accum, [key, value]) => {
                accum[key] = {
                  ...value,
                  filterSelected: true
                }

                return accum
              }, {})

              setSelectAll(true)
              setInnerItemsMap(newMap)
            } else {
              let newMap = Object.entries({...innerItemsMap}).reduce((accum, [key, value]) => {
                accum[key] = {
                  ...value,
                  filterSelected: false
                }

                return accum
              }, {})


              setInnerItemsMap(newMap)
              setSelectAll(false)
            }
          }}/>
        <FD.ListText>Select all</FD.ListText>
      </FD.SelectAllLine>
      <FD.List
        dataSource={listOfItems}
        renderItem={itemKey => {

          let item = innerItemsMap[itemKey]
          if (!item) {
            return (<List.Item></List.Item>)
          }

          return (<List.Item>
              <Checkbox checked={item.filterSelected} onChange={function (e) {

                let checkValue = e.target.checked
                let newMap = {...innerItemsMap}
                newMap[itemKey] = {...item, filterSelected: checkValue}

                setInnerItemsMap(newMap)
              }}/>
              <FD.ListText>{itemKey}</FD.ListText>
            </List.Item>
          )
        }}
      />
      <FD.ButtonsWrapper>
        <Button
          type="primary"
          onClick={() => {
            confirm(innerItemsMap)
          }}
          size="small"
          style={{width: 90, marginRight: 8}}
        >
          OK
        </Button>
        <Button
          onClick={() => {
            clearFilters()
          }}
          size="small"
          style={{width: 90}}>
          Reset All
        </Button>
      </FD.ButtonsWrapper>


    </FD.FilterWrapper>
  )
}

const FD = {
  FilterWrapper: styled.div`
    display: flex;
    flex-direction: column;
    justify-content: start;
  `,
  ListText: styled.p`
    margin: 0px 0px 0px 8px;
  `,
  List: styled(List)`
    && {
      max-height: 200px;
      overflow-y: scroll;
      border-bottom: 1px solid #111;
      margin-bottom: 12px;
    }
  `,
  SelectAllLine: styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    border-bottom: 1px solid #111;
    padding-bottom: 12px;
  `,
  ButtonsWrapper: styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  `
}

export default FilterDropdown
