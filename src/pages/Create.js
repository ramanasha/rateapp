import React, { Component } from 'react'
import { NavBar } from '../Components/'
import Dropzone from 'react-dropzone'
import { Button } from 'react-bootstrap'

export default class Collections extends Component {
  constructor(props){
    super()
    this.state = {
      title: "",
      comparisons: [""],
      categories: [],
      files: [],
      dropzoneActive: false,
    }
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  onDragEnter() {
    this.setState({
      dropzoneActive: true
    })
  }

  onDragLeave() {
    this.setState({
      dropzoneActive: false
    })
  }

  componentDidMount(){
  }

  componentWillUnmount(){
  }

  uploadFile(file){
    let data = new FormData();
    data.append("image", file)
    fetch("/image", {
      mode: 'no-cors',
      method: "POST",
      body: data
    }).then( res => res.json() )
    .then( res => {
      let files = this.state.files
      files.forEach( (f,i) => {
        if(f[0].preview === file.preview){
          files[i][1] = false
          files[i][2] = res.filename
        }
      })
      this.setState({ files })
    })
  }

  onDrop(files, a, b) {
    let newFiles = this.state.files
    files.forEach((file, index) => {
      newFiles.push([file, true])
      this.uploadFile.call(this, file)
    })
    this.setState({
      files: newFiles,
      dropzoneActive: false
    })
  }

  removeFile(filed){
    let newFiles = this.state.files
    newFiles = newFiles.filter(file => {
      return file[0].preview !== filed.preview
    })
    if(window){
      window.URL.revokeObjectURL(filed);
    }
    this.setState({ files: newFiles })
  }

  setField(target, e){
    let object = {}
    if(target==="categories"){
      object[target] = e.target.value.toLowerCase().replace(/\s+/g,' ').trim().split(" ")
        .reduce( (res, next) => { if(!res.includes(next)){res.push(next)} return res } , [] )
    }else{
      object[target] = e.target.value
    }
    this.setState(object)
  }

  setComparison(index, e){
    let newComparison = this.state.comparisons
    newComparison[index] = e.target.value
    this.setState({ comparisons: newComparison })
  }

  addComparison(){
    let newComparison = this.state.comparisons
    newComparison.push("")
    this.setState({ comparisons: newComparison })
  }

  removeComparison(index){
    let newComparison = this.state.comparisons
    newComparison.splice(index, 1)
    this.setState({ comparisons: newComparison })
  }

  handleSubmit(e){
    e.preventDefault()
    let data = {
      ownerId: "5904ffed92d85439221abf0c",
      title: this.state.title,
      subtitle: this.state.comparisons,
      images: this.state.files.map(file => file[2])
    }
    fetch("/collections", {
      method: "POST",
      headers:{
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data)
    }).then( res => res.json() )
    .then( res => {
      this.props.history.push('/collections/'+res.url)
    })
  } 

  render() {
    const { files, dropzoneActive } = this.state
    const overlayStyle = {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex:10,
      padding: '2.5em 0',
      background: 'rgba(0,0,0,0.5)',
      textAlign: 'center',
      lineHeight:'500px',
      color: '#fff'
    }
    const comparisons = this.state.comparisons
      .map( (string, index) => {
        return(
          <div key={index}>
            <input type="text" value={string} onChange={this.setComparison.bind(this, index)} />
            { index>0 &&
              <Button bsSize="small" className="worst" onClick={this.removeComparison.bind(this, index)}>Remove</Button>
            }
          </div>
        )
      })

    let dropzoneRef
    console.log(this.state)

    return(
      <Dropzone
        ref={(node) => { dropzoneRef = node; }}
        disableClick
        style={{}}
        accept="image/jpeg, image/png, image/gif"
        onDrop={this.onDrop.bind(this)}
        onDragEnter={this.onDragEnter.bind(this)}
        onDragLeave={this.onDragLeave.bind(this)}
      >
        <NavBar />
        <div className="container">
          <h2>Let's create a new collection!</h2>
          <hr />
          { dropzoneActive && <div style={overlayStyle}>Drop images...</div> }
          <form onSubmit={this.handleSubmit}>
            <div className="singleField">
              <label htmlFor="title">Title</label><br />
              <input id="title" type="text" onChange={this.setField.bind(this, "title")}/>
            </div>
            <div className="singleField">
              <label>Comparison questions</label>
              {this.state.comparisons.length<10 && 
                <Button className="add" bsSize="small" onClick={this.addComparison.bind(this)}>Add</Button>
              }
              <div>
                { comparisons }
              </div>
            </div>
            <div className="singleField">
              <label htmlFor="categories">Categories, separated by space</label><br />
              <input id="categories" type="text" onChange={this.setField.bind(this, "categories")}/>
            </div>

            <p>Drag and drop images or press button below</p>
            <Button onClick={() => { dropzoneRef.open() }}>
              Upload files
            </Button>
            <div className="preview-container">
              {
                files.map((f, index)=> {
                  return (
                    <div key={index} >
                      { f[1] && <div className="loader imageloader">Loading...</div> }
                      <img className={f[1]?'preview loading':'preview'} src={f[0].preview} alt="" />
                      <div className="previewDelete">
                        <Button
                          onClick={this.removeFile.bind(this, f[0])}
                          className="worst"
                          bsSize="small"
                        >Delete</Button>
                      </div>
                    </div>
                  )}
                )
              }
            </div>
            <hr />
            <Button type="submit">Create</Button>
          </form>
        </div>
      </Dropzone>
    )
  }
}
