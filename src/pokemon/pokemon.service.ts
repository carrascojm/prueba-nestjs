import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

@Injectable()
export class PokemonService {

  constructor(

    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>

  ){}

  async create(createPokemonDto: CreatePokemonDto) {

    createPokemonDto.name = createPokemonDto.name.toLowerCase().trim();

    try {

      const pokemon = await this.pokemonModel.create( createPokemonDto );
      return pokemon;

    } catch (error) {

      this.handleExceptions ( error )

    }

  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(val: string) {
    let pokemon: Pokemon

    // Busco por no
    if ( !isNaN(+val) ) {
      pokemon = await this.pokemonModel.findOne({ no: val })
    }

    // Busco por MongoID
    if ( !pokemon && isValidObjectId( val ) ) {
      pokemon = await this.pokemonModel.findById( val )
    }

    // Busco por nombre
    if ( !pokemon ) {
      pokemon = await this.pokemonModel.findOne({ name: val.toLowerCase().trim() })
    }

    if ( !pokemon )
      throw new NotFoundException(`Pokemon with id, mane or no "${ val }" not found`)

    return pokemon;
  }

  async update(val: string, updatePokemonDto: UpdatePokemonDto) {
    
    const pokemon = await this.findOne( val )

    if ( updatePokemonDto.name )
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase().trim();

    try {

      await pokemon.updateOne( updatePokemonDto );
      return { ...pokemon.toJSON() , ...updatePokemonDto };

    } catch (error) {

      this.handleExceptions ( error )

    }
    
    
  }
  
  async remove(id: string) {
  
    // const pokemon = await this.findOne( id );
    // await pokemon.deleteOne();

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });

    if ( deletedCount === 0 )
      throw new BadRequestException(`Pokemon with id "${ id }" not found`)

    return;

  }
  
  private handleExceptions ( error: any ) {
    
    if ( error.code === 11000 ) {
      throw new BadRequestException(`Pokemon exists in db ${ JSON.stringify( error.keyValue ) }`);
    } 
    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`);

  }

}
