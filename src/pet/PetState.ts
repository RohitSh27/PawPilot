import { PetMood } from '../types';

export class PetStateMachine {
  private currentMood: PetMood = 'IDLE';

  constructor(initialMood: PetMood = 'IDLE') {
    this.currentMood = initialMood;
  }

  public getMood(): PetMood {
    return this.currentMood;
  }

  public setMood(mood: PetMood): PetMood {
    this.currentMood = mood;
    return this.currentMood;
  }
}
