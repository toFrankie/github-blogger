import {useQuery} from '@tanstack/react-query'
import {getMilestones} from '@/utils/rpc'

export default function useMilestones() {
  const {data: milestones = [], isLoading: milestonesLoading} = useQuery({
    queryKey: ['milestones'],
    queryFn: getMilestones,
  })

  return {
    milestones,
    milestonesLoading,
  }
}
