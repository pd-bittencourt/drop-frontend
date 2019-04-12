import React, { Component } from 'react';
import api from '../../services/api';
import { distanceInWords } from 'date-fns';
import pt from 'date-fns/locale/pt'
import Dropzone from 'react-dropzone'
import socket from 'socket.io-client'


import { MdInsertDriveFile } from 'react-icons/md'

import logo from '../../assets/logo.svg'
import './styles.css';

export default class Box extends Component {
  state = {
    box: {}
  }
  // componentDidMount - para disparar uma chamada API assim que o componente for criado, assim que o user acessar a rota. Renderizado automaticamente assim q o componente é renderizado em tela
  async componentDidMount() {
    this.subscribeToNewFiles()

    // react-router (no routes.js chamamos a props de 'id')
    const box = this.props.match.params.id
    const response = await api.get(`boxes/${box}`)
    
    this.setState( {box: response.data} )
  }
  
  subscribeToNewFiles = () => {
    const box = this.props.match.params.id
    const io = socket('https://drop-backend.herokuapp.com')

    // ver no backend
    io.emit('connectRoom', box)

    io.on('file', data => {
      // como alterar de files dentro do box? 
      // copiar/clonar o box todo
      // monificar files: copiar todos arquivos dos files
      this.setState({ box: {...this.state.box, files: [data, ...this.state.box.files, ]} })
    })
  }

  handleUpload = (files) => {
    files.forEach( file => {
      const data = new FormData()
      const box = this.props.match.params.id

      // ver o tipo de input no insomnia
      data.append('file', file)
      
      api.post(`boxes/${box}/files`, data)

    })
  }

  render() {
    return (
      <div id="box-container">
        <header>
          <img src={logo} alt=""/>
          <h1>{this.state.box.title}</h1>
        </header>

        {/* o conteudo do dropzone precisa ser uma funcao */}
        <Dropzone onDropAccepted={this.handleUpload}>
          { ({getRootProps, getInputProps}) => (
            <div className="upload" { ... getRootProps() } >
              <input { ... getInputProps() }/>
              <p>Arraste arquivos ou clique aqui</p>
            </div>  
          ) }
        </Dropzone>

        <ul>
          { this.state.box.files && this.state.box.files.map(file => (
            <li key={file._id}>
              <a className="fileInfo" href={file.url} target="_blank">
                <MdInsertDriveFile size={24} color="#A5CFFF" />
                <strong>{file.title}</strong>
              </a>
              <span>há{" "} {distanceInWords(file.createdAt, new Date(), {locale:pt})}</span>
            </li>
          )) }
        </ul>

      </div>
    )
  }
}
