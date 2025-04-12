import {useQuery} from '@tanstack/react-query'
import {getMilestones} from '@/service/api'

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
