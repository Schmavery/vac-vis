import React, { Component } from 'react/addons';
import {Calendar} from './calendar'

export class App extends Component {
  constructor (props) {
    super(props);
    this.state = {
      siteName: 'Vacation Visualiser',
      modal: null,
    };

    this.helper = {
      addElement: (type, el, cb) => {
        this.helper.deepUpdate({[type]:{$push: [el]}}, cb)
      },
      deepUpdate: (el, cb) => {
        var newState = React.addons.update(this.state, el);
        this.setState(newState, cb);
      },
      setSiteName: name => this.setState({siteName:name}),
      getStateDebug: () => this.state,
      displayModal: (body, cb) => {
        document.body.style.overflow='hidden'
        this.setState({modal: {body: body, callback:cb}})
      },
    }


    Object.keys(this.helper).forEach(k => this.helper[k].bind(this));
    window.helper = this.helper;
    this.closeModal = this.closeModal.bind(this);
  }

  closeModal() {
    document.body.style.overflow='auto'
    this.setState({modal:null})
  }

  render() {
    return (
      <div>
        {this.state.modal ?
          <ModalOverlay close={this.closeModal}>
            {this.state.modal.body(this.closeModal)}
          </ModalOverlay>
          : ""}
        {(<Calendar fns={this.helper} />)}
      </div>);
  }
}
