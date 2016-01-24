import React, { Component } from 'react';

function daysInMonth (year, month){
  var d= new Date(year, month+1, 0);
  return d.getDate();
}

function monthName(month){
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'][month];
}


function addMonth(date, num){
  var nextMonth = new Date(date);
  nextMonth.setMonth(date.getMonth() + num);
  return nextMonth;
}

function dateToDateObj(date){
  return ({day:date.getDate()-1,month:date.getMonth(),year:date.getFullYear()});
}

function eqDateObj(d1, d2){
  return (d1.day === d2.day && d1.month === d2.month && d1.year === d2.year);
}

function dateObjToString(d){
  return d.day + "/" + d.month + "/" + d.year;
}

export class Calendar extends Component {
  constructor(props){
    super(props);
    this.state = {
      startDate: new Date(),
      startAmount: 10,
      incAmount: 5,
      dayLength: 8,
      isPayday: isPayday,
      checked: [],
      currDate: new Date(),
      cache: {}
    };
    this.getHours = this.getHours.bind(this);
    this.check = this.check.bind(this);
    this.isChecked = this.isChecked.bind(this);
    this.cache = this.cache.bind(this);
    this.isCheckable = this.isCheckable.bind(this);
    this.c = {};
  }

  isCheckable(dateObj){
    var d = new Date(dateObj.year, dateObj.month, dateObj.day + 1);
    if (d.getDay() === 0 || d.getDay() === 6){
      return false;
    }
    if (d < this.state.startDate){
      return false;
    }
    if (isHoliday(dateObj)){
      return false;
    }

    return true;
  }

  cache(key, val){
    if (val){
      this.c[key] = val;
    } else {
      return this.c[key];
    }
  }

  componentWillUpdate(){
    // Invalidate cache
    this.c = {};
  }

  getHours(dateObj, i){
    var key = dateObjToString(dateObj);
    if (this.cache(key)){
      return this.cache(key);
    }

    var hours;
    var d = new Date(dateObj.year, dateObj.month, dateObj.day + 1);
    if (eqDateObj(dateToDateObj(this.state.startDate), dateObj)){
      hours = this.state.startAmount;
    } else if (d < this.state.startDate){
      return '-';
    } else {

      var oneDayLess = new Date(d);
      if (oneDayLess < this.state.startDate)
        return oneDayLess.toString();
      oneDayLess.setDate(oneDayLess.getDate() - 1);
      var oneDayLessObj = dateToDateObj(oneDayLess);
      hours = this.getHours(oneDayLessObj, (i || 0) + 1);
    }
    var todayMod = 0;
    if (this.state.isPayday(dateObj)){
      todayMod = this.state.incAmount;
    }
    if (this.isChecked(dateObj)){
      todayMod -= this.state.dayLength;
    }
    hours += todayMod;
    this.cache(dateObjToString(dateObj), hours);
    return hours;
  }

  isChecked(dateObj){
    return (this.state.checked.filter(e => eqDateObj(e, dateObj)).length > 0);
  }

  check(dateObj){
    if (!this.isCheckable(dateObj)) return;
    if (!this.isChecked(dateObj))
      this.setState(React.addons.update(this.state, {checked:{$push:[dateObj]}}));
    else {
      var newArr = this.state.checked.filter(e => dateObj.day !== e.day ||
                                                  dateObj.month !== e.month ||
                                                  dateObj.year !== e.year);
      this.setState({checked: newArr});
    }
  }

  render() {
    var nextMonth = addMonth(this.state.currDate, 1);
    return (
      <div style={{margin:10,textAlign:'center'}}>
        <Controller cal={this}/>
        <Month month={this.state.currDate.getMonth()} year={this.state.currDate.getFullYear()} cal={this}/>
        <Month month={nextMonth.getMonth()} year={nextMonth.getFullYear()} cal={this}/>
      </div>
    );
  }
}

class Controller extends Component {
  render () {
    var currMonth = this.props.cal.state.currDate;
    var arrowStyle = {
      display:'inline-block',
      backgroundColor:'lightGray',
      borderRadius:10,
      border:'1px solid black',
      padding:'2px 7px',
      cursor:'pointer'
    };
    return (
      <center>
        <div style={arrowStyle}
          onClick={() => this.props.cal.setState({currDate:addMonth(currMonth, -1)})}>◀</div>
          <span style={{margin:"0px 20px"}}>CALENDAR</span>
        <div style={{marginRight:20,...arrowStyle}}
          onClick={() => this.props.cal.setState({checked:[]})}>
          Clear All
        </div>
        <div style={arrowStyle}
          onClick={() => this.props.cal.setState({currDate:addMonth(currMonth, 1)})}>▶</div>
        <div style={{margin:10}}>
        Start Amount:
        <input
          style={{marginLeft:10}}
          type='text'
          value={this.props.cal.state.startAmount}
          onChange={e => this.props.cal.setState({startAmount:parseInt(e.target.value)||0})} />
        <br />
        Increment Amount:
        <input
          style={{marginLeft:10}}
          type='text'
          value={this.props.cal.state.incAmount}
          onChange={e => this.props.cal.setState({incAmount:parseInt(e.target.value)||0})} />

        </div>
      </center>
    );
  }
}

class Month extends Component {
  render (){
    var cal = this.props.cal;
    var d = new Date(this.props.year, this.props.month, 1);
    var padding = d.getDay();
    return (
      <div style={{width:450, display:'inline-block',textAlign:'left',verticalAlign:'top'}}>
        <div style={{textAlign:'center'}}>{monthName(this.props.month) + " " + this.props.year}</div>
        {[...Array(daysInMonth(this.props.year, this.props.month) + padding)].map((v,i) =>
          (<Day
              fake={false}
              checked={cal.isChecked({day:i-padding,month:this.props.month,year:this.props.year})}
              day={i-padding}
              month={this.props.month}
              year={this.props.year}
              check={cal.check}
              getHours={cal.getHours}
              isCheckable={cal.isCheckable}
              key={this.props.year+"/"+this.props.month+"/"+(i-padding)}/>))
          }
      </div>
    );
  }
}

class Day extends Component {
  constructor(props) {
    super(props);
    this.getBackgroundColor = this.getBackgroundColor.bind(this);
  }

  getBackgroundColor(dateObj){
    if (this.props.day < 0) {
      return "#222";
    }
    if (isPayday(dateObj)) {
      if (this.props.checked) return "#f00";
      else return "#f66";
    } else if (!this.props.isCheckable(dateObj)){
      return "#888";
    } else {
      if (this.props.checked) return "#06f"
      else return "#9cf"
    }
  }

  render() {
    var fake = this.props.day < 0;
    var dateObj = {day:this.props.day, month:this.props.month, year:this.props.year};
    return (
      <div style={{
        width:55,
        height:55,
        backgroundColor:this.getBackgroundColor(dateObj),
        display:'inline-block',
        border:'1px solid grey',
        margin:fake? '2px 2px -9px 2px' : '2px 2px 2px 2px',
        paddingLeft:2,
        cursor:fake || !this.props.isCheckable(dateObj) ? 'deafautl' : 'pointer',
      }}
        onClick={() => this.props.check(dateObj)}>
        {!fake && (<div><div style={{
          marginTop:5,
          marginRight:'auto',
          color:'white',
          backgroundColor:'black',
          display:'inline-block',
          padding:'1px 3px',
          borderRadius:10,
          border:'1px solid white'
          }}>
            {this.props.day + 1}
        </div>
        <div style={{
          textAlign:'right',
          marginRight:5,
          marginTop:5,
        }}>
          {this.props.getHours(dateObj)}
        </div>
      </div>)}
      </div>
    );
  }
}


function isPayday(dateObj){
  var paydays = [
    {month: 1, day: 15},
    {month: 1, day: 31},
    {month: 2, day: 15},
    {month: 2, day: 28},
    {month: 3, day: 15},
    {month: 3, day: 31},
    {month: 4, day: 15},
    {month: 4, day: 30},
    {month: 5, day: 15},
    {month: 5, day: 31},
    {month: 6, day: 15},
    {month: 6, day: 30},
    {month: 7, day: 15},
    {month: 7, day: 31},
    {month: 8, day: 15},
    {month: 8, day: 31},
    {month: 9, day: 15},
    {month: 9, day: 30},
    {month: 10, day: 15},
    {month: 10, day: 31},
    {month: 11, day: 15},
    {month: 11, day: 30},
    {month: 12, day: 15},
    {month: 12, day: 31}
  ];
  return paydays.filter(v => v.month === dateObj.month + 1 && v.day === dateObj.day + 1).length > 0;
}

function isHoliday(dateObj){
  var holidays = [
    {month: 1, day: 1, event: 'New Year’s Day'},
    {month: 1, day: 18, event: 'Birthday of Martin Luther King, Jr.'},
    {month: 2, day: 15, event: 'Washington’s Birthday'},
    {month: 5, day: 30, event: 'Memorial Day'},
    {month: 7, day: 4, event: 'Independence Day'},
    {month: 9, day: 5, event: 'Labor Day'},
    {month: 10, day: 10, event: 'Columbus Day'},
    {month: 11, day: 11, event: 'Veterans Day'},
    {month: 11, day: 24, event: 'Thanksgiving Day'},
    {month: 12, day: 26, event: 'Christmas Day'}
  ];
  return holidays.filter(v => v.month === dateObj.month + 1 && v.day === dateObj.day + 1).length > 0;
}
