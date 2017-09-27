import React from 'react'
import 'isomorphic-fetch'

/**
 * A higher order function that repeatedly triggers a function
 * every given interval as long as target component is mounted.
 * Useful for ensuring reachability of servers.
 */
export default options => (WrappedComponent) => {
  const {
    endpoint = "/api/is-reachable",
    interval = 10000,
    isDoubleIntervalOnFailure = true
  } = options

  class EnsureReachability extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        intervalEnsureReachability: interval,
        isLoadingEnsureReachability: false,
        isReachableEnsureReachability: true
      }
    }

    testIfReachable = () => {
      this.setState({ isLoadingEnsureReachability: true })

      return new Promise(resolve => resolve(

        fetch(endpoint)
          .then(() => {
            this.setState({
              isLoadingEnsureReachability: false,
              isReachableEnsureReachability: true
            })

            return true
          })
          .catch(() => {
            this.setState({
              isLoadingEnsureReachability: false,
              isReachableEnsureReachability: false
            })

            return false
          })
      ))
    }

    start = () => {
      this.testIfReachable()
        .then(isReachable => {
          const newInterval =
            !isReachable && isDoubleIntervalOnFailure ? this.state.intervalEnsureReachability * 2 : interval

          this.setState({ intervalEnsureReachability: newInterval })
          this.timeoutID = setTimeout(this.start, newInterval)
        })
    }
    stop = () => {
      this.timeoutID && clearInterval(this.timeoutID)
      this.setState({ intervalEnsureReachability: interval / 2 })
    }
    reset = () => {
      this.stop()
      this.start()
    }

    componentDidMount() {
      this.start()
    }
    componentWillUnmount() {
      this.stop()
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          {...this.state}
          resetEnsureReachability={this.reset} />
      )
    }
  }

  return EnsureReachability
}
