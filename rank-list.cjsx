{React, ReactBootstrap} = window
{Input, Alert} = ReactBootstrap
Divider = require './divider'
__ = window.i18n["poi-plugin-senka-calc"].__.bind(window.i18n["poi-plugin-senka-calc"])

RankList = React.createClass
  getInitialState: ->
    filterShow: true
  handleFilterShow: ->
    {filterShow} = @state
    filterShow = not filterShow
    @setState {filterShow}
  handleClickCheckbox: (index) ->
    {baseDetail} = @props
    baseDetail.rankListChecked[index] = !baseDetail.rankListChecked[index]
    @props.handleCheckedChange baseDetail.rankListChecked
    @setState { }
  render: ->
    <div className='table-container'>
      <div className='col-container'>
        <div onClick={@handleFilterShow}>
          <Divider text={__ 'Filter'} icon={true} hr={true} show={@state.filterShow}/>
        </div>
        <div style={marginTop: '-15px'}
             className={if @state.filterShow then 'show' else 'hidden'}>
           {
             if @props.baseDetail?.rankListChecked?
               for rank, index in @props.ranks
                 <Input type='checkbox'
                        label={rank}
                        key={rank}
                        onChange={@handleClickCheckbox.bind(@, index)}
                        checked={@props.baseDetail.rankListChecked[index]}/>
           }
        </div>
      </div>
      <div className='col-container'>
        <Alert bsStyle='danger'
               className={if @props.updatedFlag then 'hidden' else 'show'} >
          {__ 'It will save when all rates is updated'}
        </Alert>
        <div className='table-container'>
          <div className='col-container'>
            <span className='title'>{__ 'Ranking'}</span>
            {
              #if @props.rankList?
                for checked, index in @props.baseDetail.rankListChecked
                  continue if !checked
                  <span key={index}>{@props.ranks[index]}</span>
            }
          </div>
          <div className='col-container'>
            <span className='title'>{__ 'Rate'}</span>
            {
              #if @props.rankList?
                for checked, index in @props.baseDetail.rankListChecked
                  continue if !checked
                  <span key={index} style={@props.getStatusStyle !@props.isUpdated[index]}>
                    {@props.baseDetail.senkaList[index]}(↑{@props.baseDetail.listDelta[index]})
                  </span>
            }
          </div>
        </div>
      </div>
    </div>

module.exports = RankList
