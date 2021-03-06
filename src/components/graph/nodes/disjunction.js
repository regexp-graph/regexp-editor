import React from 'react'
import equal from 'deep-equal'
import getClientRect from '../../../utils/get-client-rect'
import Connector from '../connector/connector'
import nodeByType from '../node-by-type'
import './disjunction.css'

export default class Disjunction extends React.Component {
	constructor(props) {
		super(props)
		this.childrenDimensions = {}
		this.state = {
			dimensions: null,
			childrenDimensions: null
		}
	}

	updateDimensions() {
		const parentRect = getClientRect(this.el)
		const dimensions = {
			rect: { ...parentRect },
			baseline: parentRect.height / 2
		}

		this.setState({
			dimensions,
			childrenDimensions: { ...this.childrenDimensions }
		})

		if (this.props.onDimensionsChanged) {
			this.props.onDimensionsChanged(dimensions)
		}
	}

	componentDidUpdate() {
		if (!equal(this.childrenDimensions, this.state.childrenDimensions)) {
			this.updateDimensions()
		}
	}

	componentDidMount() {
		this.updateDimensions()
	}

	renderConnectors() {
		const { data } = this.props
		const { dimensions, childrenDimensions } = this.state

		if (!dimensions) {
			return null
		}

		const list = []

		data.body.filter(node => node.raw !== '').forEach((node, i) => {
			const childDimensions = childrenDimensions && childrenDimensions[i]

			if (!childDimensions) {
				return
			}

			list.push(
				<Connector
					key={`left:${childDimensions.rect.left}:${childDimensions.rect.right}:${childDimensions.rect.top}`}
					fromX={0}
					fromY={dimensions.rect.height / 2}
					toX={childDimensions.rect.left - dimensions.rect.left}
					toY={childDimensions.baseline + childDimensions.rect.top - dimensions.rect.top}
					turn={25}
				/>,
				<Connector
					key={`right:${childDimensions.rect.left}:${childDimensions.rect.right}:${childDimensions.rect.top}`}
					fromX={childDimensions.rect.right - dimensions.rect.left}
					fromY={childDimensions.baseline + childDimensions.rect.top - dimensions.rect.top}
					toX={dimensions.rect.width}
					toY={dimensions.rect.height / 2}
					turn={dimensions.rect.width - 25}
				/>
			)
		})

		return list
	}

	renderChildren() {
		return this.props.data.body.filter(node => node.raw !== '').map((node, i) => {
			const Node = nodeByType[node.type]

			return (
				<Node
					{...this.props}
					style={null}
					data={node}
					onDimensionsChanged={dimensions => this.childrenDimensions[i] = dimensions}
					key={i}
				/>
			)
		})
	}

	render() {
		return (
			<div className='node disjunction' style={this.props.style} ref={el => this.el = el}>
				{ this.renderConnectors() }
				{ this.renderChildren() }
			</div>
		)
	}
}
