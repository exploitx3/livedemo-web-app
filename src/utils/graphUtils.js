import ReportTypes from '../constants/ReportTypes'
import moment from 'moment-timezone'
import React from 'react'
import echarts from 'echarts/lib/echarts'


export function getChartHappySad(conversations, startTimestamp, endTimestamp, reportType) {
  let showOnlyHoursInLabel = reportType === ReportTypes.dailyReport


  conversations = conversations.sort((first, second) => {
    return second.endTimestamp - first.endTimestamp
  })

  const viewDays = getViewDays(startTimestamp, endTimestamp)
  // const viewDays = getViewDays(conversations[0].endTimestamp, conversations[conversations.length - 1].endTimestamp)

  let hourlyContainer = {}
  if (reportType === ReportTypes.dailyReport) {
    //by 2 hourly
    conversations.forEach((msg) => {
      let date = moment(msg.endTimestamp).format('YYYY-MM-DD-k')
      if (!hourlyContainer[date]) {
        hourlyContainer[date] = []
      }
      hourlyContainer[date].push(msg)
    })

    conversations = Object.entries(hourlyContainer).map(entry => {
      let date = entry[0]
      let analysesArr = entry[1]
      let joyAvg = analysesArr.reduce((accum, value) => {
        accum += value.analysis.Joy
        return accum
      }, 0) / analysesArr.length
      let sadnessAvg = analysesArr.reduce((accum, value) => {
        accum += value.analysis.Sadness
        return accum
      }, 0) / analysesArr.length
      let fearAvg = analysesArr.reduce((accum, value) => {
        accum += value.analysis.Fear
        return accum
      }, 0) / analysesArr.length
      let angerAvg = analysesArr.reduce((accum, value) => {
        accum += value.analysis.Anger
        return accum
      }, 0) / analysesArr.length

      return {
        endTimestamp: moment(date, 'YYYY-MM-DD-k').toDate().getTime(),
        analysis: {

          Joy: joyAvg,
          Sadness: sadnessAvg,
          Fear: fearAvg,
          Anger: angerAvg,


        }
      }
    })
  } else if (reportType === ReportTypes.weeklyReport) {
    //by daily
    conversations.forEach((msg) => {
      let date = moment(msg.endTimestamp).format('YYYY-MM-DD')
      if (!hourlyContainer[date]) {
        hourlyContainer[date] = []
      }
      hourlyContainer[date].push(msg)
    })

    conversations = Object.entries(hourlyContainer).map(entry => {
      let date = entry[0]
      let analysesArr = entry[1]
      let joyAvg = analysesArr.reduce((accum, value) => {
        accum += value.analysis.Joy
        return accum
      }, 0) / analysesArr.length
      let sadnessAvg = analysesArr.reduce((accum, value) => {
        accum += value.analysis.Sadness
        return accum
      }, 0) / analysesArr.length
      let fearAvg = analysesArr.reduce((accum, value) => {
        accum += value.analysis.Fear
        return accum
      }, 0) / analysesArr.length
      let angerAvg = analysesArr.reduce((accum, value) => {
        accum += value.analysis.Anger
        return accum
      }, 0) / analysesArr.length

      return {
        endTimestamp: moment(date, 'YYYY-MM-DD').toDate().getTime(),
        analysis: {

          Joy: joyAvg,
          Sadness: sadnessAvg,
          Fear: fearAvg,
          Anger: angerAvg,


        }
      }
    })
  } else {
    //by weekly
    conversations.forEach((msg) => {
      let date = moment(msg.endTimestamp).week()
      if (!hourlyContainer[date]) {
        hourlyContainer[date] = []
      }
      hourlyContainer[date].push(msg)
    })

    conversations = Object.entries(hourlyContainer).map(entry => {
      let date = entry[0]
      let analysesArr = entry[1]
      let joyAvg = analysesArr.reduce((accum, value) => {
        accum += value.analysis.Joy
        return accum
      }, 0) / analysesArr.length
      let sadnessAvg = analysesArr.reduce((accum, value) => {
        accum += value.analysis.Sadness
        return accum
      }, 0) / analysesArr.length
      let fearAvg = analysesArr.reduce((accum, value) => {
        accum += value.analysis.Fear
        return accum
      }, 0) / analysesArr.length
      let angerAvg = analysesArr.reduce((accum, value) => {
        accum += value.analysis.Anger
        return accum
      }, 0) / analysesArr.length

      return {
        endTimestamp: moment().weeks(date).toDate().getTime(),
        analysis: {

          Joy: joyAvg,
          Sadness: sadnessAvg,
          Fear: fearAvg,
          Anger: angerAvg,


        }
      }
    })
  }

  // let showSymbol = reportType !== ReportTypes.dailyReport
  let showSymbol = false


  let listMax = 0
  let listMin = 100
  let list = conversations.map(function (item) {
    let neutralValue = 25
    let sad = Math.round((item.analysis.Sadness + Number.EPSILON) * 100) / 100
    let happy = Math.round((item.analysis.Joy + Number.EPSILON) * 100) / 100
    let value = Math.round(((neutralValue + happy - sad) + Number.EPSILON) * 100) / 100
    if (value > listMax) {
      listMax = value
    }

    if (value < listMin) {
      listMin = value
    }
    let symbol = 'image://data:image/png;base64,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'
    if (value > 30) {
      symbol = 'image://data:image/png;base64,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'
    } else if (value < 20) {
      symbol = 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGgAAABoCAYAAAAdHLWhAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAYBvQAGAb0BWevxIgAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAABOkSURBVHic7V17XJTF3v/OLOyFqwgC3hAQvAChgte8l5liHrVMU9/s1NF67dNraallaZumaXWwtzq+3UvTLDzlJS+vZRqImnlLU1QUENACFLnuLrvL88z5YwVNYWf2jsr3H+XZmfnN8/s+c/vNb35DcItg6UYWpzNgUHWNnFRlYF3L9aS9wQQ/o5kpTWZ46Y1Q1phBAUDtDdlHBZPSG7Uqb2LSKFEd5MsK/NTktJ+aHvHVIGP+WJLl6XcSAfF0BRqCVssoicPIS5XSI0XlpH9uCWtfXQMvZ8rw16A2KpQUtAli+4L98DXLUmzXaonsTBnOQJMh6N1tTHXxijwr/zKm5hQhpkLPvN0pP9CHmDuG4VxkKFa1CaLvzEwhRnfKbwweJ0j7TW1KYSle+L0AA8r1cCspjcFPjdr49uR4hxC28vVJXp96si4eIUirZVQfKy84lodn80pYkCfqIIqoUHKlWwe845NDl3iiC3QrQdrdzEt/UZ53NA8v5F9iLdwp21G0DUZVjyjyeWQInevO7s9tBM1dI728P5vNLy6Hj7tkugLhLaC/uzNZtGyKYrk75LmcoCUbWPcT+fKaw7ks3tWy3ImECJKfFEUfeeUh8osr5biMoNQ0pskul9btPUNGG82MukoOAARoAB8VgUbJAAAGE4HeyFBpcKVUQOUNeWAXuikmkEyZPYG4RJpLCNKmsd77suVt50tYsLPKDAsEkqMJosOAqFCCyFCCyFaAn9p6vuoa4PwlIK+YIa+EIbcEOJzLUFLhrJoBHcPIlXsS6QNzRpP9zivVAqcT9PxqaeGu37FAZ2QOLSx9VcCQeII+sQR9Ywk6tHJWDS3IKwEOnJXxy1kgPYtB7+Cw76+GlJJElix+RPGqc2pogdMIemsH8806x37cly33Y8y+MhQU6NcJGNubYthdgEbpnjmMwQT8cIxh0yGG/WcYZDvrTwjQvzP2JoQo7nNWl+cUDSxNY61+OS8fPX2BtbUnv68KmDSA4LHBFKGBzqiR/SgqZ1idDqzbK9vdquLbkz+GJ9IeM+4nJY7Wx2GC3tjAIjNOyYdyimwfb/zUwKT+BNOHUQQ2scl3dQ2wbi/DxztlVOhtzx8VSsoGx9G+8x8k2Y7UwyGCXt/Aev94VNr1Zzl8bclHCTC6J8H8cRQtbMrpflQaGN7bDqzdI0Oy0Y7QtiX0KYls2JwHve2ePNhN0OsbWO+tB+WM0mqmsiVftw4Erz5MEN/e42ZAm3CyENCul3E837YBKsSfGFO6SYNemaD81R65dmlp8b9Z7M7j0lFbWo6XApj9AMHjQynorcVNPWQGfL5bRuoWhlpJPF/bltA/0EvR4/lRtnd3Nqtq6XeVwXtO+56xZcxpHUSQ+hhFUpSt0pomfi9gmPWFjMJS8TxRoaRsWBztMudB2yYONhH01g7mm3lMzj51gbURzTMknuDN/2p6kwBHUaEH5q6R8fNJ8S4vrh25MCiSdrJlCm6TCSbrHPvRFnLG9iJYOe32IwcAAn2AldMoJt4t/o1nXWDtTpZKO2yRI0zQvC+l+fuy5X6i6acOplg2hULhUiucZ6GgwGsTKJ4ZIU5S5mkMnLtWErY2CJWsTWO9Nx2U9uqMYn4Bc8cQ/OOe25iZBvDJTzLe2izW3fmpUTu+tzxg/njlAV5arhbf2sF892fL20XJ+e/h9I4jBwCm3Uvx1H1iLam6Bl57shVbU9OYhpeWq8mcfGltXglrKSJ4bC+C51Ju0Tm0EzBrFMX4vmLvn1PEgnMqpS956awSpE1jvfeeIaNFBA5NIFg6mYLcufyAEGDRRIrBcWJK2HMa45ZvMPW2lsYqQccL5G9ENttaBxEsm3x7TwhEoaDA21Mp2gr0OTUm0MPnFV9ZS9OoSl9aK71wooBFilRoxWNN36bmTgRogHf+TuGt4Kf9LY91nLdGerGx3xskSJvGlJln2GsilXlhNEWP28RC4EwkdiB4bpRYV3fgHHtFm8aUDf3WIEFVenmpiPfNXREEfx96Bw86HDxxD0X3SL5+/rgCX12N3GCDuIkgrZbRo/nsSV6hlAALx5Nb1vDpDlh0JDY2Hz2Pp7Xam8f7mx7oY+UFF0rhzytwykCKxA7N7PAQ3x6Y0I+vp4LLLEAfI7904/ObCDqWh2d5hQX6ADNThOt4x2P2aIoA7pIUOH4es2989heCFn5T+5CIr/TUwRQBmubWI4oADfDoIL6+cktYS20a+9v1z/5C0IVSzOIVolECUwY2k2MrHhtC4Suw91xYyp6//u96gt7dxlQnCmB1VQtYxp6g5jWPzQj0ASYN4M8WThTKfa+fctfnuHhFnsU7n6OgwKODHKpnPYxmi4uTwWSnE5obYDAxFJUzGM3OKW/qYMKd0ZVVQ2mslZ+p+7veQp1/GVN5Avp2Ighv4Vj3dqIQeHebjH1nGMySZSqaFE0wYzjBgC5No+vMPA2s3CHjaJ7FidFbAfTvQjBzJEV8e/vLDQsE+nUiyDxt/aMsuITHAaQCV1uQVstoThFieALG9nJMgVuPMDyyQkJ6loUcwOKIcSiHYdoHMj7a6fnW9NFOhmkfSDice83D1CwBP59kmLhCwtYjjtVxjIAOzxaxTnX/tzS4eKTwzoT6qoD7Eu0nKKeY4cW1cj0xN4IxIHWLzP26XIk9pxhSt8hozHXZLAEvrpWRW2y/jPsSCXw4k4VyHZTa9ebhwFWCLldIE3kFD44j0DRoLRLDxzsZTLXW0zAGrNzhOYL+taNxcupgqgU+/sn+k5AaJYS2I0or6STgKkFF5aQ/L0OfWLvrBADYe0ZM8UfzGAwmx2TZA50ROHZeLO1eB1t5H+5gAhRVYABwlaDcEsYd+vp2cmyzp6xaLJ3MgLJq97eiCj2ETzWU6RyTJaLLvGLLVg9dtpnF84JEhAUCkQ6ezxE9teClAIL93T+ba+lnkS2CMAdPYESF8vVRaYDX4rSazrRKJw/kFZgc7bjChiaIlXF3JwKVB6IlqL2BvoLd+JB4x7eOk6L4+jBKXoOozohkXsLoMIfrg+n3Eq79zksBPDvKc/vmz6ZQbisK0ADThzn+wYrotLqGJNNKPevCSxjZyvEKhbcgeP8fjRtZlV7AsikUCQ4sBB1FYgeCNyZTKBvp8AM0wL+mKRzu4gDLOVseqmpIV69yPWkPWB8do8KcMyb0iQU2zyP4+Cdg9wmG4gog2N/SrU0fRhAT7nlLwt96EsS1o/hoJ8P+bIbSKiC8haWLnn4vQbiTwm+IjOllOhZBRi6VLvNOKhxapoC/wH5GM8RRaQB6vWj9DEtMGC7TGnPDzgp1UFA0k+MC+KvBdRcw1kJJjSbrFmyeWaIZ9oEQcC0zNWZ40xqz9TWQr8rz48LtCl9OEA6jGd60xgSrE0sflectzLcreDusBlOzs26TB1UrYXUqoTc2d3Gugo4TKEOjhOSlUaLWmi1OZ2y6XZypFjhZyJBbzFBcYYlwBVgiX4UFMnQMJ4hrRxpdeHoavEgmKm+YvVTeMANodLjSGy37NE3lWInBBGw/yrD1CMPBnOv9Ba7/kFj9v2pvoGdH4IFkihHdHdvTciYY4xOkthBETNYsCZIMVNUwj/vBGUyWY4Zr9jCU22DurzFbfAwyT8tYvtHi0/f4UPcFamoMlQb+9obKCyaqUYK7U1Nw2bMvs+sEw/2vS3j//20j50aU6YD/3SZj5FKG9CzPdt35l/jy1SpSTVv4sEJewrxiz7yMJANLvpPx9Ccyip0YgO/PMoanPpKxbKPt8XechfOX+Gla+JB86q8hp/iFuZ8gUy3wzKcyVqczrp+APWAM+Hw3w/98JnN9JVyBvBL+S/lr2Cnqp8YRXkJHvFjsQa0EzPxcxq4Trv8wfvqd4bkv3N+SRHTqq2KHqa+GZvASHs51bwtavolht43kEAKEBBCEBBCbZ5w//c7w5ib3MiSiUyWtzSAAkDyv1lxlsG6T2/GKwmG/BBH8eJzhmU/FlBUTTjCmF8GQeIKOYai3i0gycK7I4my46SBDjuAY+n/TKe4R3Jp3BLnFwMil1rcaAjQwH1ruZVnCRYWSguP5LNpahgNnmVN2Vq2hygBo0/jktAoA5o2hGJXc8Ak/BQU6twE6t7FsBG45zLB8o4zLVdbL1abJ6BOrEDqF4AgOnON/MFFhJP8QrrpdtQli+3gZfsl2fTf32W7GVWJyNMGGOQqM7il2/JISyy7phjkKrvNLcYVl4uBq7BfQZZsgZAJXCQr2U3zNy/BzlmsdCnVGYNXP1ltP90iCT2cQtAqwvfzQQODTGQTdOMc2v/jZ/mCyItAbgQyBNVhLX/oVcJUgloXtgT7E6iELvdEyPrgKmw8xq8bDVgHAh09ShywAGiXBh09RhFg5gVtlALY46CBvDT8c53/oQX4wvTqB/AjUn24gcscwnOMVvumg6yq+7Yj11vPiWOcEywjytZRlDduPuu49RXQYE3YtdGZ9TSNDsYqXcX82c+qKvg46I3A4t/HfY1sDDyQ7b4IyuidBbOvGy/v1nGu686JyJjSWRwSj/lKpeoLaBNF3WvjAajcnycDqdOevF04WwupC8aE+zt9XHNur8d9qJSDrgvNb0ep0voE0yA8mlZKurPu7/s1nphBjQgS4AebWZTK7An1bw7ki67UeFOdceQD/CEj2H84lqFxniWbPw13t6X7tBFLffv/yabYLxju8AnRG4MsM51beWrep9HKOZ+uNiA6zvpFXUulcmavSxWaH7YJJ6vV//4WgRRO9vo0KJVd4haxOl1FpcB5J7YPRqHfEiO78g7f2QEGB+7s1TIKCQiicmCgqDcAarkENiA4jpdoJZPP1z26q4bw10sINv/IjXU0ZSLBwfLPPiQi06xnWZfK7t3G9yMvLH1Usvf7ZTRrWnKOvtwsGZz1vGYtsDZN/J+JkIZC2j09ORAip1OTQZTc+byDaFZF7RJIPeAXKDHhtvWz3XTt3Aup0JLKVkRSN9xq6BrTBPspfQ18JbwHuXO1EIfDZrmaGGsNnuxiOCfQybVsSnU9bqm3ot4YjLk4gpv5dFAtEKpG6RcaRPJGUdxaO5TOs2Cq2ZuwTi8XaoaTBfV2rc8nxb0u5xwsYN+Bl6yCCjXOa45bWodIAjH1TwkXufBjoHknOpc1WNHr40uo0LKGtNEHlDe5n8GcZw9w1nnPAaEqQZGD2KlmIHLUScnJHaZK1NNbjZk9SHhrYlW62lqYO6VmWSCKucPC4VcAYsOBrGXtOiSlhUBf67bwxykPW0nAXMjEBZHJ0GBG6KWfzIUsolTsVb38v49sDYuTEhOFyckfCDWDFJWj2BGLo25mO8FNDyDnpo50MnzgQKuVWheW9xcjx16B2cJw86vGhpIaXVsgUoB1PDg1PJAtFvWXe2syw5DvX+LM1NTAGvLddxj+/F/soCQHuTSCL5o0Tu9POJovgEytrMzNPgxvXpw5je1nuc7hdTyFJMvBqmoz1+8W/xEFdkf7JDK8houltUl1CiOK+uHbkgmj6jQcZnv7EvntImzrKdMCTH9pGTkIEKezfRTHCFjn2XTJ4yud0TjFCRPPcbpcMHs+3eKOKTKXrEBVKroxKol1mphABr+xrsO+azg2s487fpN/+LIOfaB4vBTBrFMET99y613RKMvDxThnvbmc2rfnatiS6scm0x7OjyVlbZdp/0W2aqfe2Y4qMy1W2XXSb2IFA+7BjsT89gWP5DK+tZzhZeAtcdFuHFd+zpC1HpPTCUvGWBFy7KvqlcU0/xHOlAXhvO7Prquh2LYl+ZKLsmaui6/DGBhaZkSUdtGVMqoOvCnior+XuN2u+ap5AmQ5Yk2E5/lIpfOvpNUSHkbJBXT182Xod3v6ehWSeko9mXWDt7MnvowIm9aeYOhgOh312FH+WMaxKZ/h6r/2uV4kdyMV7E/RJM+73t+nW4YbgNG2kpjHNicvSD3vPYIC9C1RKLLG5x/QiGC4QHddZ0BmBH45ZTkIcOMvs3oQkBBjYlWb070zuF7ESCJXpjEKux9w10ss7jzMtL8wmDxolMKgrQb/OBH1iiFOCCl6PnGKGA2eBX84yZGTB4Qj4ARpIKUlk8aKJCqGby0Thkv5Eu87U80CuYntOMbN5XGoMrQKAnh0JokItLlORrYAOrQj32pcKveXA7vlLlmOHucWWw1OXKp1VMyA2HFeGxMkpc8byL661FS7r8FPTmCanUvoy4xTGGc22WSxshb8G8FFeix5lMAF6k8UR3pVQKyEP7IrvekYrHnVWl3YjXD4iL/k3SzxxQf7qcC6Ld7UsdyIhguQnRUgT7F3fiMJtU6aXvpLm7s9mC/+4gia+8rGOti2Jrl8nvLp0suKf7pDn1jmtdjfz0l+U5/2Wx54/fwncm76aEtoFo6p7FPk8QE3nXO877Wp4ZNGh1TJqiJXnH8vDrFzBe8I9hegwUtotAqmaHLqsIb81V8PjZkttmnnEH2Vk5slCDL1U2XhQJ3ciyA+muLb0cPtgecWiR7zWe7IuHieoDto0pjTW4pmCS/LjZ4tYp3Id3BqXKsgPpphwciYiBF+ovOj77uzGrKHJEHQjtOvNw69U0clFFRiQW8Q6VHLiONiKAA3M0eGkoHUL7Anxo+sWPEx+cGb5zkKTJehGLE6r6Vwjew/W1SC5ykC6lOlYRI2R+ZkkoqwxMW+9Cd518VfVSkg+SpjVSmJWKphJrSLVQb6kwF/NTvmp2WEflSLdUSOmu/AfNHJVoi1oeAQAAAAASUVORK5CYII='

    }

    return {
      name: item.endTimestamp,
      value: [item.endTimestamp, value],
      symbolSize: 40,
      symbol: symbol,
    }
  })
  const happySadList = {
    name: 'happy-sad',
    list: list,
    startColor: 'rgb(0,206,53)',
    endColor: 'rgba(0,85,251,0.54)'

  }

  let xMax = viewDays.endDateSet.toDate()
  let xMin = viewDays.startDataSet.toDate()
  let xMaxInterval = 3600 * 1000 * 2

  if (reportType === ReportTypes.weeklyReport) {

    xMax = viewDays.endDateSet.toDate()
    xMin = viewDays.startDataSet.toDate()
    xMaxInterval = (3600 * 1000 * 24) * 7
  } else if (reportType === ReportTypes.monthlyReport) {

    xMax = viewDays.endDateSet.toDate()
    xMin = viewDays.startDataSet.toDate()
    xMaxInterval = (3600 * 1000 * 24) * 5
  } else if (reportType === ReportTypes.quarterlyReport) {

    xMax = viewDays.endDateSet.toDate()
    xMin = viewDays.startDataSet.toDate()
    xMaxInterval = (3600 * 1000 * 24) * 30
  }

  const option = {

    // Make gradient line here
    visualMap: [

      {
        show: false,
        type: 'continuous',
        seriesIndex: 0,
        target: {
          inRange: {
            color: ['#0055fb', 'rgba(0,85,251,0.5)', 'rgba(0,206,53,0.51)', '#00CE35'],
            //00CE35
          }
        },
        min: 0,
        max: 50,
        itemHeight: '75%'
      },
    ],


    title: [],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'none'
      },
      feature:
        {
          dataZoom: {
            yAxisIndex: 'none',
          },
          restore: {},
          saveAsImage: {}
        },
      formatter: function (data, index) {
        let value = data[0].value[1]

        return value > 30 ? 'Happy' : (value < 20 ? 'Sad' : 'Neutral')
      }
    },
    // legend: {
    //   top: '5%',
    //   data: ['happy-sad']
    // },
    xAxis: {
      // data: dateList,
      maxInterval: xMaxInterval,
      // interval: (3600 * 1000 * 24) * 30,
      type: 'time',
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        formatter: function (value, index) {
          // console.log(value)
          // console.log(moment(value).format('D MMM - H:mm A'))
          if (showOnlyHoursInLabel) {

            return moment(value).format('H:mm A')
          } else {

            return moment(value).format('D MMM - H:mm A')
          }
        },
        fontSize: 12,
        // fontFamily: '\'Baloo Chettan 2\', cursive',
        // borderWidth: 2,
        // borderColor: mainColors.primaryColor,
        // borderRadius: 14,
        padding: 0
      },
      splitLine: {
        show: true
      },
      // min: viewDays.endDateSet.toDate(),
      max: xMax,
      min: xMin,
      // boundaryGap: [viewDays.endWeek.toDate(), viewDays.startWeek.toDate()],
      // boundaryGap: [viewDays.startMonth.toDate(), viewDays.endMonth.toDate()],
      // min: viewDays.endDateSet.toDate(),
      // max: viewDays.startWeek.toDate(),

    },
    yAxis: [{
      show: true,
      inside: true,
      interval: 25,
      min: 0,
      max: 50,
      splitLine: { show: true },
      axisLine: { show: false },
      minorTick: { show: false },
      axisLabel: {
        formatter: function (value, index) {

          return value > 25 ? 'Happy' : (value === 25 ? 'Neutral' : 'Sad')
        },
        fontSize: 14,
        fontFamily: '\'Baloo Chettan 2\', cursive',
        inside: false,
        borderBottom: 10,
        padding: [8, 0, 18, 0]
      },
    }],
    grid: [{
      show: 1,
      height: '60%',
      width: '80%',
      containLabel: false,
      backgroundColor: '#FFF',

    }],
    toolbox: {
      showTitle: false,
      right: '1%',
      feature: {
        dataZoom: {
          yAxisIndex: 'none'
        },
        saveAsImage: {}
      }
    },
    dataZoom: [
      {

        type: 'inside',
        start: 0,
        end: 100,
        filterMode: 'none'
      },
      {
        showDataShadow: false,

        start: 90,
        end: 100,
        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '80%',
        // showDetail: false,
        labelFormatter: function (value, index) {

          let formatValue = moment(value).format('D MMM-h:mm A').split('-').join('\n')

          return formatValue
        },
        handleStyle: {
          color: '#fff',
          shadowBlur: 3,
          shadowColor: 'rgba(0, 0, 0, 0.6)',
          shadowOffsetX: 2,
          shadowOffsetY: 2
        }
      }
    ],

    series: [happySadList].reduce((accum, info) => {
      let obj = {
        name: info.name,
        type: 'line',
        animation: false,
        smooth: 0.3,
        showSymbol: showSymbol,
        data: info.list,
        sampling: 'average',
        connectNulls: true,
        lineStyle: {
          width: 4.5
        }
      }
      if (info.name === 'neutral') {
        obj['areaStyle'] = {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: info.startColor
          }, {
            offset: 1,
            color: info.endColor
          }])
        }
      }
      accum.push(obj)

      return accum
    }, [])

  }

  return option
}

export function getLineWidthPercentageFromEmotion(emotionCount) {
  let minEmotion = 20
  let maxEmotion = 25
  let range = maxEmotion - minEmotion
  emotionCount = Math.min(Math.max(minEmotion, emotionCount), maxEmotion)

  let percentage = Math.floor(((emotionCount - minEmotion) / range) * 100)

  return percentage
}

function getViewDays(startDateTimestamp, endDateTimestamp) {


  let nowStr = moment().tz('America/New_York').format('LLLL')
  console.log(nowStr)
  let startDay = moment(nowStr, 'LLLL').startOf('day')
  let endDay = moment(nowStr, 'LLLL').endOf('day')
  let startWeek = moment(nowStr, 'LLLL')
  let endWeek = moment(nowStr, 'LLLL').endOf('day').subtract(7, 'days')
  let startMonth = moment(nowStr, 'LLLL').endOf('day')
  let endMonth = moment(nowStr, 'LLLL').endOf('day').subtract(1, 'month')

  let startDataSet = moment(startDateTimestamp).subtract(1, 'minutes')
  let endDateSet = moment(endDateTimestamp).subtract(1, 'minutes')
  // if (endDateSet < endWeek) {
  //   endDateSet = endWeek
  // }

  return {
    startDay,
    endDay,
    startDataSet,
    endDateSet,
    startWeek,
    endWeek,
    startMonth,
    endMonth
  }
  // let now = moment()
  // let dates = channelMessageAnalyses.map(analysis => moment(analysis.ts))
  // startDay = moment().startOf('day')
  // dates.forEach(date => {
  //   if(now > date && date < startDay) {
  //     startDay = date
  //   } else {
  //     return
  //   }
  // })

}




export function addNodeHighlight(node, elementTimeouts, hoveredNodes) {
  let cy = node._private.cy
  let nodeId = node._private.data.id
  let { nodes, edges } = getConnectedEdges(node)

  let all = nodes.union(edges)


  cy.elements().difference(all).not(node).addClass('semitransp')
  node.addClass('highlight')
  all.addClass('highlight')

  hoveredNodes[nodeId] = node

  delete elementTimeouts[nodeId]
}

export function addEdgeHighlight(edge, elementTimeouts, hoveredEdges) {
  let cy = edge._private.cy
  let edgeId = edge._private.data.id
  let connectedNodes = edge.connectedNodes()

  cy.elements().difference(connectedNodes).not(edge).addClass('semitransp')
  edge.addClass('highlight')
  connectedNodes.addClass('highlight')

  hoveredEdges[edgeId] = edge

  delete elementTimeouts[edgeId]
}

export function removeElementHighlightById(elementId, cy, maps) {
  let { hoveredNodes, hoveredEdges } = maps

  let element = cy.getElementById(elementId)

  if (element._private.group === 'nodes') {

    removeNodeHighlight(element, hoveredNodes)
  } else {

    removeEdgeHighlight(element, hoveredEdges)
  }
}

export function removeNodeHighlight(node, hoveredNodes) {

  let cy = node._private.cy
  let nodeId = node._private.id

  let { nodes, edges } = getConnectedEdges(node)

  let all = nodes.union(edges)

  cy.elements().difference(all).not(node).removeClass('semitransp')
  node.removeClass('highlight')
  all.removeClass('highlight')

  delete hoveredNodes[nodeId]
}

export function removeEdgeHighlight(edge, hoveredEdges) {
  let cy = edge._private.cy
  let edgeId = edge._private.data.id
  let connectedNodes = edge.connectedNodes()

  cy.elements().difference(connectedNodes).not(edge).removeClass('semitransp')
  edge.removeClass('removeClass')
  connectedNodes.removeClass('removeClass')

  delete hoveredEdges[edgeId]

}


export function unfocusElementWithTimeout(elementId, cy, maps) {
  let {
    draggedNodes,
    hoveredNodes,
    elementTimeouts,
    hoveredEdges
  } = maps

  let element = cy.getElementById(elementId)
  if (elementTimeouts[elementId]) {

    clearTimeout(elementTimeouts[elementId])

    delete elementTimeouts[elementId]
  } else {

    if(element.length !== 0) {

      removeElementHighlightById(elementId, cy, maps)
    }
  }

}

export function focusElementWithTimeout(elementId, cy, maps) {
  let {
    draggedNodes,
    hoveredNodes,
    elementTimeouts,
    hoveredEdges
  } = maps


  let element = cy.getElementById(elementId)

  let timeout = setTimeout(() => {


    focusElementById(elementId, cy, maps)

  }, 500)

  elementTimeouts[elementId] = timeout

}

export function focusElementById(elementId, cy, maps) {
  let {
    draggedNodes,
    hoveredNodes,
    elementTimeouts,
    hoveredEdges
  } = maps

  cy.stop(true, false)



  let element = cy.getElementById(elementId)

  if(element.length === 0) {
    return
  }

  if (element._private.group === 'nodes') {
    addNodeHighlight(element, elementTimeouts, hoveredNodes)
  } else {
    addEdgeHighlight(element, elementTimeouts, hoveredEdges)
  }


  let elemEdges = element.connectedEdges()
  let elemNodes = element.outgoers().union(element.incomers()).add(element)
  let focus = cy.animation({
    center: {
      eles: element
    },
    zoom: 3.25,
    duration: 700,
    easing: 'ease-out'
  })

  return focus.play()

}

export function resetHighlightedElements(cy) {
  cy.elements('.highlight').removeClass('highlight')
  cy.elements('.semitransp').removeClass('semitransp')
}

export function resetViewport(cy) {
  cy.stop(true, false)

  resetHighlightedElements(cy)

  cy.animation({
      fit: {},
      duration: 700
    })
    .play()
}

export function getConnectedEdges(node, cy) {
  let connectedEdges = node.connectedEdges()
  let connectedNodes = node.incomers().union(node.outgoers()).difference(connectedEdges)
  let conNodeIds = connectedNodes.reduce((accum, node) => {
    if (!accum[node._private.data.id]) {
      accum[node._private.data.id] = node
    }

    return accum
  }, {})


  let connsToConNodes = connectedNodes.reduce((accum, node) => {
    let connections = node.connectedEdges().filter(edgeElem => {
      let result = conNodeIds[edgeElem._private.data.target] && conNodeIds[edgeElem._private.data.source]

      return result
    })

    accum = accum.union(connections)

    return accum

  }, connectedEdges)


  return {
    nodes: connectedNodes,
    edges: connsToConNodes
  }
}
