import React from 'react';
import ReactDOM from 'react-dom';
import Canvas from './utils/canvas';
import '../stylesheets/imageeditor.scss';

const deviceEvents = {
    react: {
        down: 'onMouseDown',
        drag: 'onDragOver',
        drop: 'onDrop',
        move: 'onMouseMove',
        up: 'onMouseUp',
    },
    native: {
        down: 'mousedown',
        drag: 'dragStart',
        drop: 'drop',
        move: 'mousemove',
        up: 'mouseup',
    },
};

function float2rat(x) {
    let tolerance = 1.0E-6;
    let h1 = 1;
    let h2 = 0;
    let k1 = 0;
    let k2 = 1;
    let b = x;
    do {
        let a = Math.floor(b);
        let aux = h1;
        h1 = a * h1 + h2;
        h2 = aux;
        aux = k1;
        k1 = a * k1 + k2;
        k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(x - h1 / k1) > x * tolerance);

    return h1 + ':' + k1;
}

export default class ImageManipulation extends React.Component {
    static propTypes = {};

    state = {
        height: 200,
        width: 200,
        scale: 1.25,
        aspectRatio: 0
    };

    static defaultProps = {
        color: [213, 214, 217, 0.6],
        src: ""
    };

    componentWillMount() {
        let aspectRatio = this.props.aspectRatio || 0;
        if (!aspectRatio || aspectRatio == 'same') {
            aspectRatio = '1:1';
        }

        if (!isNaN(aspectRatio)) {
            aspectRatio = float2rat(aspectRatio);
        }

        this.setState({ aspectRatio: aspectRatio });
    }

    componentDidMount() {
        this.setState({
            height: ReactDOM.findDOMNode(imageManipulationBody).offsetHeight || 200,
            width: ReactDOM.findDOMNode(imageManipulationBody).offsetWidth || 200
        });
    }

    handleDrop(e) {
        e = e || window.event;
        e.stopPropagation();
        e.preventDefault();

        if (e.dataTransfer && e.dataTransfer.files.length) {
            let reader = new FileReader();
            let file = e.dataTransfer.files[0];
            reader.onload = e => console.log(e.target.result);

            reader.readAsDataURL(file);
        }
    }

    handleScale() {
        let scale = parseFloat(this.refs.scale.value);
        this.setState({ scale: scale });
    }

    saveImage() {
        let img = this.refs.canvasmanipulator.getImage().toDataURL();
        this.props.onSave && this.props.onSave(img);
    }

    closePopup() {
        let img = this.refs.canvasmanipulator.getImage().toDataURL();
        this.props.onClose && this.props.onClose(img);
    }

    aspectRatioChanged(event) {
        let val = event.target.value;
        this.setState({ aspectRatio: val });
    }

    loadComponent() {
        let className = this.props.className || '';
        let customAspectRatio = this.props.customAspectRatio || false;
        let attributes = {};

        attributes[deviceEvents.react.drop] = this.handleDrop.bind(this);

        return (
            <div className={'_outer-box ' + className}>
                <div className="_box-header">
                    Image Editor
                    <div className="close-btn" onClick={ this.closePopup.bind(this) } />
                </div>
                <div className="_box-body" id="imageManipulationBody">
                    <Canvas ref="canvasmanipulator" deviceEvents={ deviceEvents } height={this.state.height}
                        width={this.state.width} aspectRatio={ this.state.aspectRatio } scale={ this.state.scale }
                        color={ this.props.color } image={ this.props.src }/>
                    <div className="image-manipulation-scale">
                        <input name="scale" type="range" ref="scale" onChange={this.handleScale.bind(this)} min="1" max="2"
                        step="0.01" defaultValue={ this.state.scale }/>
                    </div>
                </div>
                <div className="_box-footer">
                    {customAspectRatio ? 
                        <div>
                            <select onChange={ this.aspectRatioChanged.bind(this) }>
                                <option value="1:1">1:1</option>
                                <option value="2:3">2:3</option>
                                <option value="3:2">3:2</option>
                                <option value="3:4">3:4</option>
                                <option value="4:3">4:3</option>
                                <option value="4:5">4:5</option>
                                <option value="5:3">5:3</option>
                                <option value="9:5">9:5</option>
                                <option value="16:9">16:9</option>
                                <option value="16:10">16:10</option>
                                <option value="21:9">21:9</option>
                                <option value="25:11">25:11</option>
                            </select>
                        </div> : "" 
                    }
                    <div className="image-crop-btn" onClick={ this.saveImage.bind(this) }>
                        CROP & SAVE
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className="_react-image-manipulation">
                <div className="_cover-box">
                    { this.loadComponent() }
                </div>
            </div>
        );
    }
}
