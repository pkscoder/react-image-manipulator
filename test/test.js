import ReactDOM from 'react-dom';
import React from 'react';
import ImageEditor from '../components/ImageEditor';

var TestModule = React.createClass({
	
	onSaveEditedImage(img) {
	    window.open(img)
	},

    render() {
		return(
			<ImageEditor src="http://assets.myntassets.com/w_980,c_limit,fl_progressive,dpr_2.0/assets/images/banners/2016/8/18/11471539799577-Slideshow-1920-x-1080-px--3-.jpg" 
				customAspectRatio={true} 
				onSave={ this.onSaveEditedImage.bind(this) }
			/>
		);
	}
});

ReactDOM.render(
	<TestModule />, document.getElementById('app-container')
);
