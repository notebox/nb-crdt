import type {uint32} from "@/domain/entity"

export const checkIfNewerStamp = (
  curr?: Stamp | null,
  other?: Stamp | null
): boolean => {
  if (!curr) return true
  if (!other) return false
  if (curr[1] === other[1]) return curr[0] < other[0]
  return curr[1] < other[1]
}

export const checkIfNewerOrEqualStamp = (
  curr?: Stamp | null,
  other?: Stamp | null
): boolean => {
  if (!curr) return true
  if (!other) return false
  if (curr[1] === other[1]) return curr[0] <= other[0]
  return curr[1] <= other[1]
}

export type Stamp = [replicaID: uint32, timestamp: number /* uint64 */];
