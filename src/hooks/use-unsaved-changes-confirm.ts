import {useConfirm} from '@primer/react'

interface UseUnsavedChangesConfirmOptions<T = void> {
  onConfirm: (arg?: T) => void
}

export function useUnsavedChangesConfirm<T = void>({
  onConfirm,
}: UseUnsavedChangesConfirmOptions<T>) {
  const confirm = useConfirm()

  const handleWithUnsavedChanges = async (isChanged: boolean, arg?: T) => {
    if (isChanged) {
      const result = await confirm({
        title: 'Unsaved Changes',
        content:
          'You have unsaved changes. Creating a new issue will discard your current changes. Do you want to continue?',
        cancelButtonContent: 'Cancel',
        confirmButtonContent: 'Continue',
        confirmButtonType: 'danger',
      })

      if (!result) return
    }
    onConfirm(arg)
  }

  return handleWithUnsavedChanges
}
