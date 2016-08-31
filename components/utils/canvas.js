import React from 'react';
import ReactDOM from 'react-dom';

const SIZE_PERCENT = 75;

export default class Canvas extends React.Component {
    state = {
        drag: false,
        my: null,
        mx: null,
        image: {
            x: 0,
            y: 0
        }
    };

    static defaultProps = {
        scale: 1.25
    };

    componentDidMount() {
        let context = ReactDOM.findDOMNode(this.refs.canvas).getContext('2d'),
            deviceEvents = this.props.deviceEvents;

        if (this.props.image) {
            this.loadImage(this.props.image);
        }

        this.paint(context);

        if (document) {
            let nativeEvents = deviceEvents.native;
            document.addEventListener(nativeEvents.move, this.handleMouseMove.bind(this), false);
            document.addEventListener(nativeEvents.up, this.handleMouseUp.bind(this), false);
        }
    }

    componentDidUpdate() {
        let context = ReactDOM.findDOMNode(this.refs.canvas).getContext('2d'),
            dimensions = this.getDimensions();

        context.clearRect(0, 0, dimensions.canvas.width, dimensions.canvas.height);

        this.paint(context);
        this.paintImage(context, this.state.image);
    }

    componentWillReceiveProps(newProps) {
        if (this.props.image != newProps.image || this.props.aspectRatio != newProps.aspectRatio) {
            this.loadImage(newProps.image);
        }
        if (this.props.scale != newProps.scale || this.props.height != newProps.height || this.props.width != newProps.width) {
            this.squeeze(newProps);
        }
    }

    squeeze(props) {
        let imageState = this.state.image;
        imageState.y = this.getBoundedY(imageState.y, props.scale);
        imageState.x = this.getBoundedX(imageState.x, props.scale);
        this.setState({image: imageState});
    }

    getDimensions() {
        let parentWidth = this.props.width,
            parentHeight = this.props.height,
            aspectRatio = this.props.aspectRatio,
            borderVertical, borderHorizontal;

        let height = parentHeight ? (parentHeight * SIZE_PERCENT) / 100 : SIZE_PERCENT,
            width = parentWidth ? (parentWidth * SIZE_PERCENT) / 100 : SIZE_PERCENT;

        if (!aspectRatio || aspectRatio == 'same') {
            aspectRatio = '1:1';
        }

        if (isNaN(aspectRatio)) {
            aspectRatio = eval(aspectRatio.replace(':', '/'));
        }

        if (aspectRatio <= 1) {
            borderVertical = ((parentHeight - height) / 2);
            borderHorizontal = ((parentWidth - (height * aspectRatio)) / 2);
        } else {
            borderVertical = ((parentHeight - (width / aspectRatio)) / 2);
            borderHorizontal = ((parentWidth - width) / 2);
        }

        return {
            width: (parentWidth - (borderHorizontal * 2)),
            height: (parentHeight - (borderVertical * 2)),
            borderHorizontal: borderHorizontal,
            borderVertical: borderVertical,
            canvas: {
                width: parentWidth,
                height: parentHeight
            }
        }
    }

    paint(context) {
        context.save();
        context.translate(0, 0);
        context.fillStyle = "rgba(" + this.props.color.slice(0, 4).join(",") + ")";

        let dimensions = this.getDimensions();

        let height = dimensions.canvas.height,
            width = dimensions.canvas.width,
            borderHorizontal = dimensions.borderHorizontal,
            borderVertical = dimensions.borderVertical;

        context.beginPath();
        context.rect(borderHorizontal, borderVertical, width - borderHorizontal * 2, height - borderVertical * 2);
        context.rect(width, 0, -width, height); // outer rect, drawn "counterclockwise"
        context.fill('evenodd');

        context.restore();
    }

    paintImage(context, image) {
        if (image.resource) {
            let position = this.calculatePosition(image);
            context.save();
            context.globalCompositeOperation = 'destination-over';
            context.drawImage(image.resource, position.x, position.y, position.width, position.height);

            context.restore();
        }
    }

    calculatePosition(image) {
        image = image || this.state.image;
        let x, y, width, height, dimensions = this.getDimensions();

        width = image.width * this.props.scale;
        height = image.height * this.props.scale;

        let widthDiff = (width - dimensions.width) / 2,
            heightDiff = (height - dimensions.height) / 2,
            borderHorizontal = dimensions.borderHorizontal,
            borderVertical = dimensions.borderVertical;

        x = image.x * this.props.scale - widthDiff + borderHorizontal;
        y = image.y * this.props.scale - heightDiff + borderVertical;

        return {
            x: x,
            y: y,
            height: height,
            width: width
        }
    }

    handleImageReady(image) {
        let imageState = this.getInitialSize(image.width, image.height);
        imageState.resource = image;
        imageState.x = 0;
        imageState.y = 0;
        this.setState({drag: false, image: imageState});
    }

    getInitialSize(width, height) {
        let newHeight, newWidth, dimensions, canvasRatio, imageRatio;

        dimensions = this.getDimensions();

        canvasRatio = dimensions.height / dimensions.width;
        imageRatio = height / width;

        if (canvasRatio > imageRatio) {
            newHeight = (dimensions.height);
            newWidth = (width * (newHeight / height));
        } else {
            newWidth = (dimensions.width);
            newHeight = (height * (newWidth / width));
        }

        return {
            height: newHeight,
            width: newWidth
        };
    }

    loadImage(imageURL) {
        let imageObj = new Image();
        imageObj.onload = this.handleImageReady.bind(this, imageObj);
        imageObj.crossOrigin = 'anonymous';
        imageObj.src = imageURL;
    }

    handleDrop(e) {
        e = e || window.event;
        e.stopPropagation();
        e.preventDefault();

        if (e.dataTransfer && e.dataTransfer.files.length) {
            let _self = this,
                reader = new FileReader(),
                file = e.dataTransfer.files[0];
            reader.onload = function (e) {
                _self.loadImage(e.target.result);
            }
            reader.readAsDataURL(file);
        }
    }

    handleDragOver(e) {
        e = e || window.event;
        e.preventDefault();
    }

    handleMouseMove(e) {
        e = e || window.event;
        if (false == this.state.drag) {
            return;
        }

        let imageState = this.state.image;
        let lastX = imageState.x;
        let lastY = imageState.y;

        let mousePositionX = e.targetTouches ? e.targetTouches[0].pageX : e.clientX;
        let mousePositionY = e.targetTouches ? e.targetTouches[0].pageY : e.clientY;

        let newState = {mx: mousePositionX, my: mousePositionY, image: imageState};

        if (this.state.mx && this.state.my) {
            let xDiff = (this.state.mx - mousePositionX) / this.props.scale;
            let yDiff = (this.state.my - mousePositionY) / this.props.scale;

            imageState.y = this.getBoundedY(lastY - yDiff, this.props.scale);
            imageState.x = this.getBoundedX(lastX - xDiff, this.props.scale);
        }

        this.setState(newState);
    }

    handleMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        this.setState({
            drag: true,
            mx: null,
            my: null
        });
    }

    handleMouseUp() {
        if (this.state.drag) {
            this.setState({drag: false});
        }
    }

    getBoundedX(x, scale) {
        let image = this.state.image;
        let dimensions = this.getDimensions();
        let widthDiff = Math.floor((image.width - dimensions.width / scale) / 2);
        widthDiff = Math.max(0, widthDiff);
        return Math.max(-widthDiff, Math.min(x, widthDiff));
    }

    getBoundedY(y, scale) {
        let image = this.state.image;
        let dimensions = this.getDimensions();
        let heightDiff = Math.floor((image.height - dimensions.height / scale) / 2);
        heightDiff = Math.max(0, heightDiff);
        return Math.max(-heightDiff, Math.min(y, heightDiff));
    }

    getImage() {
        // get relative coordinates (0 to 1)
        let cropRect = this.getCroppingRect();
        let image = this.state.image;
        // get actual pixel coordinates
        cropRect.x *= image.resource.width;
        cropRect.y *= image.resource.height;
        cropRect.width *= image.resource.width;
        cropRect.height *= image.resource.height;

        // create a canvas with the correct dimensions
        let canvas = document.createElement('canvas');
        canvas.width = cropRect.width;
        canvas.height = cropRect.height;

        // draw the full-size image at the correct position,
        // the image gets truncated to the size of the canvas.
        canvas.getContext('2d').drawImage(image.resource, -cropRect.x, -cropRect.y);

        return canvas;
    }

    getCroppingRect() {
        let dim = this.getDimensions();
        let frameRect = {x: dim.borderHorizontal, y: dim.borderVertical, width: dim.width, height: dim.height};
        let imageRect = this.calculatePosition(this.state.image);
        return {
            x: (frameRect.x - imageRect.x) / imageRect.width,
            y: (frameRect.y - imageRect.y) / imageRect.height,
            width: frameRect.width / imageRect.width,
            height: frameRect.height / imageRect.height,
        };
    }

    render() {
        let deviceEvents = this.props.deviceEvents,
            dimensions = this.getDimensions(),
            attributes = {
                width: dimensions.canvas.width,
                height: dimensions.canvas.height,
                style: {
                    cursor: 'move'
                }
            };

        attributes[deviceEvents.react.down] = this.handleMouseDown.bind(this);
        attributes[deviceEvents.react.drag] = this.handleDragOver.bind(this);
        attributes[deviceEvents.react.drop] = this.handleDrop.bind(this);

        return (
            <canvas ref='canvas' { ...attributes } />
        );
    }
}
