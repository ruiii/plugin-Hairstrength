{React, ReactBootstrap} = window
{Input, Alert} = ReactBootstrap
Divider = require './divider'
i18n = require './node_modules/i18n'
{__} = i18n

RankList = React.createClass
  getInitialState: ->
    filterShow: false
    rankListChecked: []
    ranks: [1, 5, 20, 100, 500]
  componentWillReceiveProps: (nextProps) ->
    if nextProps.baseDetail.rankListChecked isnt @props.baseDetail.rankListChecked
      @setState
        rankListChecked: nextProps.baseDetail.rankListChecked
  handleFilterShow: ->
    {filterShow} = @state
    filterShow = not filterShow
    @setState {filterShow}
  handleClickCheckbox: (index) ->
    {rankListChecked} = @state
    if rankListChecked isnt []
      rankListChecked[index] = !rankListChecked[index]
      if rankListChecked.length > @props.baseDetail.senkaList.length
        senkaList = @props.baseDetail.senkaList
        senkaList.splice index, 0, null
        isUpdated = @props.isUpdated
        isUpdated.splice index, 0, false
        @props.checkedChange rankListChecked, senkaList, isUpdated
      @setState {rankListChecked}
  render: ->
    <div className='col-container'>
      <div className='col-container'>
        <div onClick={@handleFilterShow}>
          <Divider text={__ 'Filter'} icon={true} hr={true} show={@state.filterShow}/>
        </div>
        <div className={if @state.filterShow then 'show' else 'hidden'}>
           {
             if @state.rankListChecked? and @state.rankListChecked isnt []
               for rank, index in @state.ranks
                 <Input type='checkbox'
                        label={rank}
                        key={rank}
                        onChange={@handleClickCheckbox.bind(@, index)}
                        checked={@state.rankListChecked[index]}/>
           }
        </div>
      </div>
      <Alert bsStyle='danger'
             className={if @props.isUpdated.every @props.isTrue then 'hidden' else 'show'} >
        {__ 'It will save when all rates is updated'}
      </Alert>
      <div className='table-container'>
        <div className='col-container'>
          <span>{__ 'Ranking'}</span>
          {
            for checked, index in @state.rankListChecked
              continue if !checked
              <span key={index}>{@state.ranks[index]}</span>
          }
        </div>
        <div className='col-container'>
          <span>{__ 'Rate'}</span>
          {
            for checked, index in @state.rankListChecked
              continue if !checked
              <span key={index} style={@props.getStatusStyle @props.isUpdated[index+1]}>
                {@props.baseDetail.senkaList[index]}
              </span>
          }
        </div>
      </div>
    </div>

module.exports = RankList
