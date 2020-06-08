import {IntegrationTest} from '../IntegrationTest';
import {getWatchReachability} from '../../watch/reachability';

export class ReachabilityIntegrationTest extends IntegrationTest {
  constructor() {
    super('Reachability');
    this.registerTest('getWatchReachability', this.testReachability);
  }

  testReachability = async () => {
    const reachable = await getWatchReachability();
    if (!reachable) {
      // The tests cannot even be executed if watch not reachable
      throw new Error('Watch should reachable');
    }
  };
}
