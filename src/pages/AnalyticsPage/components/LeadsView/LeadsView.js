import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CSSTransition, TransitionGroup, } from 'react-transition-group'

import Header from '../../../../components/Header/Header'
import ViewSession from './../../components/ViewSession/ViewSession'
import Spinner from '../../../../components/Spinner/Spinner'
import IconTextButton from '../../../../components/IconTextButton/IconTextButton'
import Button from 'antd/es/button'
import Col from 'antd/es/col'
import Icon from '../../../../components/Icon/Icon'
import Layout from 'antd/es/layout'
import Modal from 'antd/es/modal'
import Select from 'antd/es/select'

import Tabs from 'antd/es/tabs'
const { TabPane } = Tabs

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import moment from 'moment'

import Table from 'antd/es/table'

import 'antd/es/table/style'
import 'antd/es/menu/style'
import 'antd/es/dropdown/style'
import 'antd/es/badge/style'

import 'antd/es/button/style'
import 'antd/es/col/style'
import 'antd/es/layout/style'
import 'antd/es/modal/style'
import 'antd/es/select/style'
import 'rrweb-player/dist/style.css'


import axios from 'axios'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { authWithToken } from '../../../../actions/authActions'
import * as workspacesActions from '../../../../actions/workspacesActions'
import * as walkthroughActions from '../../../../actions/walkthroughActions'
import mainColors from '../../../../constants/mainColors'

import ENV from '../../../../config'
import ImagesTab from '../../../StoryDemoPage/components/Library/components/ImagesTab/ImagesTab'

const { confirm } = Modal

const { Content, Footer, Sider } = Layout


const VIEW_TYPES_SUB_DAYS = {
  '48H': '2',
  '7D': '7',
  '30D': '30',
}

const VIEW_TYPES_FORMAT = {
  '48H': 'YYYY-MM-DD hh A',
  '7D': 'YYYY-MM-DD',
  '30D': 'YYYY-MM-DD',
}

const TAB_KEYS = {
  sessions: 'sessions',
  leads: 'leads',
}

const LeadsView = function ({ leadsData, tableLeads, leadsLines, currentViewType }) {

  function convertToCSV(objArray) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';

    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (let index in array[i]) {
        if (line != '') line += ','

        line += array[i][index];
      }

      str += line + '\r\n';
    }

    return str;
  }

  function exportCSVFile(headers, items, fileTitle) {
    if (headers) {
      items.unshift(headers);
    }

    // Convert Object to JSON
    let jsonObject = JSON.stringify(items);

    let csv = convertToCSV(jsonObject);

    let exportedFilenmae = fileTitle + '.csv' || 'export.csv';

    let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, exportedFilenmae);
    } else {
      let link = document.createElement("a");
      if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        let url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", exportedFilenmae);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }

  let headers = {
    model: 'Phone Model'.replace(/,/g, ''), // remove commas to avoid errors
    chargers: "Chargers",
    cases: "Cases",
    earphones: "Earphones"
  };



  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', width: 250 },
    { title: 'Email', dataIndex: 'leadEmail', key: 'leadEmail' },
    {
      title: 'LiveDemo',
      dataIndex: 'liveDemoName',
      key: 'liveDemoName',
      render: (liveDemoName, record) => {
        let workspaceId = record.workspaceId && record.workspaceId._id
          ? record.workspaceId._id
          : record.workspaceId
        let liveDemoId = record.liveDemoId && record.liveDemoId._id
          ? record.liveDemoId._id
          : record.liveDemoId

        if (!workspaceId || !liveDemoId) {
          return liveDemoName
        }

        return (
          <Link to={`/workspace/${workspaceId}/storydemo/${liveDemoId}`}>
            {liveDemoName}
          </Link>
        )
      },
    },
    { title: 'Capture Date', dataIndex: 'createdAt', key: 'createdAt' },
    { title: 'Data', dataIndex: 'data', key: 'data' },
  ]

  function exportToFile(leadsTable, fileTitle) {
    let table = JSON.parse(JSON.stringify(leadsTable))
    table = table.map(item => {
      return {
        leadName: item.leadName,
        leadEmail: item.leadEmail,
        liveDemoName: item.liveDemoName,
        createdAt: item.createdAt,
        data: item.data,
      }
    })
    let headers = {
      leadName: 'Name',
      leadEmail: 'Email',
      liveDemoName: 'LiveDemo',
      createdAt: 'Capture Date',
      data: 'Data',
    }

    exportCSVFile(headers, table, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
  }
  return (
    <React.Fragment>
          <S.ChartWrapper>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={leadsData}>
                {Object.entries(leadsLines).map(([key, value]) => {
                  let { type, dataKey, stroke } = value

                  console.log(value)
                  return (
                    <Line key={dataKey} type={type} dataKey={dataKey} stroke={stroke}/>
                  )
                })}
                <CartesianGrid stroke="#eeeeee"/>
                <XAxis
                  dataKey={'createdAt'}
                  tickFormatter={unixTime => {
                    // console.log(unixTime)
                    return moment(unixTime).format(VIEW_TYPES_FORMAT[currentViewType])
                  }}
                  domain={[moment().valueOf(), moment().subtract(VIEW_TYPES_SUB_DAYS[currentViewType], 'day').valueOf()]}
                  type="number"
                />
                <YAxis
                  allowDecimals={false}
                  dataKey="count"
                  label={{ value: 'views', angle: -90, position: 'insideLeft' }}

                />
                <Tooltip
                  labelFormatter={(unixTime) => {
                    // console.log(unixTime)
                    return moment(unixTime).format('YYYY-MM-DD')

                  }}
                  formatter={(value, name, props) => {
                    let storyName = leadsLines[name] && leadsLines[name].storyName ? leadsLines[name].storyName : ''


                    return [value, storyName]
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </S.ChartWrapper>

      <S.HeadTitleContainer>

          <S.SessionsList__Title>Leads</S.SessionsList__Title>
        <IconTextButton
          img={<Icon type="download" />}
          onClick={() => {
            exportToFile(tableLeads, 'leads')
          }}
          buttonStyles={{
            fontSize: "11px",
            textAlign: "center",
            border: "solid 1px #ddd",
            height: 35,
            width: 165,
            borderRadius: 16
          }}
          text={'Export CSV'}
        />
      </S.HeadTitleContainer>

      <S.SessionsListWrapper>
            <Table
              columns={columns}
              dataSource={tableLeads}
              pagination={{
                position: 'bottom',
                size: 'small',
                pageSize: 5
              }}
            />

          </S.SessionsListWrapper>
    </React.Fragment>
  )
}

const S = {
  HeadTitleContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 75px;
  
  `,
  TabsContainer: styled.div`
    font-size: 19px;
    flex-grow: 1;
    justify-content: flex-end;
    align-items: center;
    

    
  `,
//   DashboardContainer: styled.div`
//     border-top-left-radius: 4px;
//     padding: 24px;
//     background: white;
//     height: 100%;
//     width: 100%;
//
//
// `,
  SpinnerWrapper: styled.div`
    position: relative;
    width: 50px;
    height: 30px;
    display: block;
    margin-left: 60px;
  `,
  ChartWrapper: styled.div`
    padding: 20px;
    border: 2px solid #F3F4F6;
    border-radius: 8px;
    margin-bottom: 20px;

  `,
  SessionsListWrapper: styled.div`
    padding: 20px;
    border: 2px solid #F3F4F6;
    border-radius: 8px;
  `,
  SessionsList__Title: styled.p`
    margin: 0px 0px 0px 0px;
    
    font-size: 1.3em;
    color: #111;
    font-family: ${mainColors.fontFamily};
  `,
  ViewsRow: styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    margin-bottom: 20px;
    
  `,
  ViewsTitle: styled.p`
    margin: 0px 15px 0px 0px;
    font-size: 1.3em;
    color: #111;
    font-family: ${mainColors.fontFamily};
    
  `,
  Content: styled(Content)`
    && {
      background: white;
      padding: 16px;
      overflow: scroll;
      overflow-x: hidden;
      border-top-left-radius: 18px;
      border-top-right-radius: 4px;
      width: 100%;
      height: 100%;
      
      border-top: 1.6px solid #1070ff;
      border-left: 1.6px solid #1070ff;
    }
    
`,
  Wrapper: styled.div`
    display: block;
    height: 100%;
    width: 100%;
    background: white;
`,
  TutorialButton: styled(Button)`
      && {
      
        background: ${mainColors.primaryColor};
        color: white;
        display: inline-block;
        //margin: 0 20px;
        //padding: 5px 15px;
        border: 0.125rem solid ${mainColors.primaryColor};
        border-radius: 2rem;
        font-family: 'Baloo Chettan 2', cursive;
        font-size: 1.0em;
        text-decoration: none;
        transition: all 0.2s;
        cursor: pointer;
      }
      &&:hover {
        background: white;
        color: ${mainColors.primaryColor};
      }
          
`,
  WorkspacesCol: styled(Col)` 
    && {
      float: unset !important;
      display: inline-block;
      vertical-align: top;
      padding: 25px;
    }
`,
  WorkspacesColRight: styled(Col)` 
    && {
      float: unset !important;
      display: inline-block;
      vertical-align: top;
      text-align: center;
      
    }
    
    @media (max-width:567px) {
      
      & {
        margin-top: 30px;
      
      }
    }
   
`,
  ExitDemoButton: styled(Button)`
   margin-left: 25px;
  `
}


export default LeadsView
