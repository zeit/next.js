import moment from 'moment'
if (typeof window !== 'undefined') {
  window.moment = moment
}
const Index = () => <h1>Current time: {moment().format('LLL')}</h1>
export default Index
