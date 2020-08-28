import { Action, ActionKey, EVENT_UPDATE_BADGE, OrderedAction } from "../../core/types"
import { createLogger } from "../../core/utils"
import { v4 as uuidv4 } from "uuid"
import * as events from "events"

const log = createLogger("sol:bg:actMng")

export class ActionManager extends events.EventEmitter {
  private actions: Map<string, Action>

  constructor() {
    super()
    this.actions = new Map<string, Action>()
  }

  addAction = (origin: string, tabId: string, action: Action) => {
    log("Adding action for origin [%s] and tab [%s] of type %s", origin, tabId, action.type)
    const key = {
      tabId: tabId,
      origin: origin,
      uuid: uuidv4()
    }
    log("Created action key: %O - %s", key, action.type)
    this.actions.set(JSON.stringify(key), action)
    this.emit(EVENT_UPDATE_BADGE)
  }

  getAction = <T extends (Action)>(key: ActionKey): T | undefined => {
    log("Getting action for key %O", key)
    return this.actions.get(JSON.stringify(key)) as T
  }

  getCount = (): number  => {
    return this.actions.size
}

  getOrderedActions = (): OrderedAction[] => {
    const out: OrderedAction[] = []
    this.actions.forEach((action, key) => {
      out.push({ key: JSON.parse(key) as ActionKey, action })
    })
    return out
  }

  deleteAction = (key: ActionKey) => {
    log("Deleting action for key %O", key)
    this.actions.delete(JSON.stringify(key))
    this.emit(EVENT_UPDATE_BADGE)
  }

  getActionsWithOriginAndType = <T extends (Action)>(origin: string, type: string): Map<ActionKey, T> => {
    log("Getting actions with origin %s and type %s", origin, type)
    const out = new Map<ActionKey, T>()
    this.actions.forEach((action, keyStr) => {
      const key = JSON.parse(keyStr) as ActionKey
      if ((action.type === type) && (key.origin === origin)) {
        out.set(key, action as T)
      }
    })
    return out
  }

  deleteActionWithOriginAndTabId = (origin: string, tabId: string) => {
    log("Deleting actions with origin %s and tabId %s", origin, tabId)
    Array.from(this.actions.keys()).forEach(keyStr => {
      const key = JSON.parse(keyStr) as ActionKey
      if ((key.origin == origin) && (key.tabId == tabId)) {
        this.actions.delete(keyStr)
      }
    })
  }

}