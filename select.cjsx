{React, ReactBootstrap} = window
{Input,} = ReactBootstrap
Divider = require './divider'
i18n = require './node_modules/i18n'
{__} = i18n

Select = React.createClass
  getInitialState: ->
    filterShow: true
    rankListChecked: []
  componentWillReceiveProps: (nextProps) ->
    if nextProps.rankListChecked isnt @props.rankListChecked
      @setState
        rankListChecked = nextProps.rankListChecked
  handleFilterPaneShow: ->
    {filterShow} = @state
    filterShow = not filterShow
    @setState {filterShow}
  handleClickCheckbox: (index) ->
    {rankListChecked} = @state
    if rankListChecked isnt []
      rankListChecked[index] = !rankListChecked[index]
      @setState {rankListChecked}
      @props.selectChanged rankListChecked
  render: ->
    <div>
      <div onClick={@handleFilterPaneShow}>
        <Divider text={__ "Filter"} icon={true} hr={true} show={@state.filterShow}/>
      </div>
      <div className={if @state.filterShow then "show" else "hidden"}>
         {
           if @state.rankListChecked? and @state.rankListChecked isnt []
             for rank, index in [1, 5, 20, 100, 500]
               <Input type='checkbox'
                      label={rank}
                      key={rank}
                      onChange={@handleClickCheckbox.bind(@, index)}
                      checked={@state.rankListChecked[index]}/>
         }
      </div>
    </div>

module.exports = Select
