{React, ReactBootstrap} = window
{Input, Alert} = ReactBootstrap
Divider = require './divider'
i18n = require './node_modules/i18n'
{__} = i18n

RankList = React.createClass
  getInitialState: ->
    filterShow: true
  handleFilterShow: ->
    {filterShow} = @state
    filterShow = not filterShow
    @setState {filterShow}
  handleClickCheckbox: (index) ->
    {rankList, baseDetail, isUpdated} = @props
    if rankList[0] isnt []
      flag = false
      if rankList[0][index]
        rankList[1][index] = null
      else
        rankList[1][index] = baseDetail.senkaList[index]
        if baseDetail.senkaList[index] is null
          isUpdated.splice index, 1, false
      rankList[0][index] = !rankList[0][index]
      @props.handleCheckedChange rankList[0], rankList[1], isUpdated
  render: ->
    <div className='table-container'>
      <div className='col-container'>
        <div onClick={@handleFilterShow}>
          <Divider text={__ 'Filter'} icon={true} hr={true} show={@state.filterShow}/>
        </div>
        <div style={marginTop: '-15px'}
             className={if @state.filterShow then 'show' else 'hidden'}>
           {
             if @props.rankList?[0]? and @state.rankList?[0] isnt []
               for rank, index in @props.ranks
                 <Input type='checkbox'
                        label={rank}
                        key={rank}
                        onChange={@handleClickCheckbox.bind(@, index)}
                        checked={@props.rankList[0][index]}/>
           }
        </div>
      </div>
      <div className='col-container'>
        <Alert bsStyle='danger'
               className={if @props.isUpdated.every @props.isTrue then 'hidden' else 'show'} >
          {__ 'It will save when all rates is updated'}
        </Alert>
        <div className='table-container'>
          <div className='col-container'>
            <span className='title'>{__ 'Ranking'}</span>
            {
              if @props.rankList?
                for checked, index in @props.rankList[0]
                  continue if !checked
                  <span key={index}>{@props.ranks[index]}</span>
            }
          </div>
          <div className='col-container'>
            <span className='title'>{__ 'Rate'}</span>
            {
              if @props.rankList?
                for checked, index in @props.rankList[0]
                  continue if !checked
                  <span key={index} style={@props.getStatusStyle @props.isUpdated[index+1]}>
                    {@props.rankList[1][index]}
                  </span>
            }
          </div>
        </div>
      </div>
    </div>

module.exports = RankList
